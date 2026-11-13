import API_BASE_URL from "../config";
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import {
    Plus, Sparkles, TrendingUp, Star, ShoppingBag, Zap, Award, Truck,
    ArrowRight, Heart, Smartphone, Watch, Headphones, Monitor, CheckCircle,
    Shirt, Sparkles as SparklesIcon, Dumbbell, Home as HomeIcon, Gem, Tag
} from 'lucide-react';
import socket from '../lib/socket';
import ProductSkeleton from '../components/ProductSkeleton';
import heroImage from '../assets/hero-shopping.jpg';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    // Hero interactivity
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tiltRef = useRef(null);
    const [peekIndex, setPeekIndex] = useState(0);
    const [peekPaused, setPeekPaused] = useState(false);

    // Gently tilt the hero photo toward the cursor
    const handleTilt = (e) => {
        const el = tiltRef.current;
        if (!el || prefersReducedMotion) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    };
    const resetTilt = () => {
        if (tiltRef.current) {
            tiltRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
        }
    };

    // Rotate through products in the "Just in" card
    useEffect(() => {
        if (featuredProducts.length < 2 || peekPaused || prefersReducedMotion) return;
        const id = setInterval(() => setPeekIndex(i => (i + 1) % featuredProducts.length), 4000);
        return () => clearInterval(id);
    }, [featuredProducts.length, peekPaused, prefersReducedMotion]);

    useEffect(() => {
        fetchProducts();

        socket.on('newProduct', (product) => {
            setProducts(prev => [...prev, product]);
        });

        return () => socket.off('newProduct');
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/products`);
            if (res.data && res.data.length === 0) {
                // If no products, try to seed or handle empty state
                await axios.get(`${API_BASE_URL}/api/seed`);
                const retry = await axios.get(`${API_BASE_URL}/api/products`);
                setProducts(retry.data);
                setFeaturedProducts(retry.data.slice(0, 4)); // Show top 4 as featured
            } else {
                setProducts(res.data);
                setFeaturedProducts(res.data.slice(0, 4));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Icons for known categories; any new category falls back to the Tag icon
    const categoryIcons = {
        electronics: Smartphone,
        accessories: Watch,
        audio: Headphones,
        computers: Monitor,
        fashion: Shirt,
        beauty: SparklesIcon,
        'sports & fitness': Dumbbell,
        'home & living': HomeIcon,
        jewellery: Gem,
        jewelry: Gem,
    };
    const categoryColors = [
        'bg-blue-100 text-blue-600',
        'bg-purple-100 text-purple-600',
        'bg-pink-100 text-pink-600',
        'bg-orange-100 text-orange-600',
        'bg-green-100 text-green-600',
        'bg-yellow-100 text-yellow-600',
        'bg-red-100 text-red-600',
        'bg-teal-100 text-teal-600',
    ];

    // Build the category list from the products in the database,
    // so any category you add in the admin panel appears automatically
    const categories = [...new Set(products.map(p => (p.category || '').trim()).filter(Boolean))]
        .map((name, idx) => ({
            name,
            icon: categoryIcons[name.toLowerCase()] || Tag,
            color: categoryColors[idx % categoryColors.length],
        }));

    return (
        <div className="bg-light min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-amber-200/50 blur-3xl pointer-events-none" aria-hidden="true"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-7 animate-slideInUp">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark leading-[1.05] tracking-tight">
                                Find something you'll love, delivered to your door.
                            </h1>

                            <p className="text-base md:text-xl text-gray-500 max-w-lg leading-relaxed">
                                Fashion, beauty, electronics and home picks from Immanuel's Store in Nairobi.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                                <Link to="/shop" className="bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
                                    Start shopping <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a href="#categories" className="bg-white text-dark px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-gray-50 transition-all border border-gray-200 shadow-sm text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30">
                                    Browse categories
                                </a>
                            </div>

                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {categories.slice(0, 6).map((cat) => (
                                        <Link
                                            key={cat.name}
                                            to={`/shop?category=${encodeURIComponent(cat.name)}`}
                                            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-dark hover:border-primary hover:text-primary hover:-translate-y-0.5 active:scale-95 transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                                        >
                                            <cat.icon className="w-4 h-4" />
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm font-medium text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> Free delivery over KSh 5,000
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> 7-day returns
                                </div>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center py-6 lg:py-10">
                            {/* Colour block behind the photo */}
                            <div className="absolute w-[88%] h-[82%] bg-amber-300 rounded-[2.5rem] -rotate-3" aria-hidden="true"></div>

                            <div
                                className="relative w-full max-w-xl"
                                onMouseMove={handleTilt}
                                onMouseLeave={resetTilt}
                            >
                                <div
                                    ref={tiltRef}
                                    className="transition-transform duration-200 ease-out motion-reduce:transition-none"
                                    style={{ transform: 'perspective(900px)' }}
                                >
                                    <img
                                        src={heroImage}
                                        alt="A small shopping cart filled with colourful shopping bags and parcels in front of a laptop"
                                        className="w-full rounded-[2rem] object-cover shadow-2xl"
                                    />
                                </div>

                                {/* Live product peek */}
                                {featuredProducts.length > 0 && (() => {
                                    const peek = featuredProducts[peekIndex % featuredProducts.length];
                                    const price = peek.sellPrice || peek.price;
                                    return (
                                        <Link
                                            key={peek._id}
                                            to={`/product/${peek._id}`}
                                            onMouseEnter={() => setPeekPaused(true)}
                                            onMouseLeave={() => setPeekPaused(false)}
                                            onFocus={() => setPeekPaused(true)}
                                            onBlur={() => setPeekPaused(false)}
                                            className="animate-fadeIn absolute -bottom-4 left-2 md:-left-6 flex items-center gap-3 bg-white p-3 pr-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                                        >
                                            <img src={peek.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-400">Just in</p>
                                                <p className="font-bold text-dark text-sm max-w-[10rem] truncate">{peek.name}</p>
                                                <p className="text-sm font-bold text-primary">KSh {price}</p>
                                            </div>
                                        </Link>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="py-10 bg-white border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Truck, title: "Free Delivery", desc: "Orders over KSh 5,000" },
                            { icon: Zap, title: "Fast Shipping", desc: "2-3 Day Delivery" },
                            { icon: Award, title: "Top Quality", desc: "100% Original" },
                            { icon: ShoppingBag, title: "Easy Returns", desc: "7-Day Policy" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-dark">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categories" className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Shop by Category</h2>
                        <p className="text-gray-500">Explore our wide range of premium products</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => (
                            <Link key={idx} to={`/shop?category=${encodeURIComponent(cat.name)}`} className="group cursor-pointer bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center block">
                                <div className={`inline-block p-4 rounded-2xl mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg text-dark">{cat.name}</h3>
                                <p className="text-sm text-gray-400 mt-2">View Collection</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section id="products" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-primary font-bold tracking-wider uppercase text-sm">Trending Now</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark mt-2">Featured Products</h2>
                        </div>
                        <a href="/shop" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                            View All <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {loading ? (
                            <ProductSkeleton count={4} />
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col">
                                    <Link to={`/product/${product._id}`} className="block relative h-64 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-dark shadow-sm">
                                            {product.category}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="absolute bottom-4 right-4 bg-white text-dark p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white z-20"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>

                                    <div className="flex-1 flex flex-col">
                                        <Link to={`/product/${product._id}`}>
                                            <h3 className="font-bold text-lg text-dark mb-1 line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                                        </Link>
                                        <div className="flex items-center gap-1 mb-3">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium text-dark">4.8</span>
                                            <span className="text-xs text-gray-400">(120 reviews)</span>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div>
                                                {product.regularPrice && product.sellPrice && product.regularPrice > product.sellPrice ? (
                                                    <>
                                                        <span className="text-xs text-gray-400 line-through">KSh {product.regularPrice}</span>
                                                        <p className="text-xl font-bold text-primary">KSh {product.sellPrice}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-xl font-bold text-primary">KSh {product.sellPrice || product.price}</p>
                                                )}
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Heart className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <a href="/shop" className="inline-flex items-center gap-2 bg-white text-dark px-6 py-3 rounded-full font-bold border border-gray-200 shadow-sm">
                            View All Products <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
