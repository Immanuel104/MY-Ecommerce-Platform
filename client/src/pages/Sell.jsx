import API_BASE_URL from "../config";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Camera, Store, Trash2, CheckCircle, PackageX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_IDEAS = ['Electronics', 'Fashion', 'Beauty', 'Home & Living', 'Sports & Fitness', 'Accessories', 'Jewellery', 'Food & Drinks', 'Services', 'Other'];

const emptyForm = { name: '', category: '', price: '', stock: 1, description: '', photos: '', contactPhone: '' };

const Sell = () => {
    const { user } = useAuth();
    const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const [form, setForm] = useState({ ...emptyForm, contactPhone: user?.phone || '' });
    const [listings, setListings] = useState([]);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const loadListings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/my-products`, authHeaders());
            setListings(res.data);
        } catch (err) {
            console.error('Could not load your listings', err);
        }
    };

    useEffect(() => { loadListings(); }, []);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const photos = form.photos.split('\n').map(p => p.trim()).filter(Boolean);
        if (photos.length === 0) {
            setError('Please add at least one photo link so buyers can see your item.');
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/api/products`, {
                name: form.name,
                category: form.category,
                description: form.description,
                price: String(form.price),
                sellPrice: Number(form.price),
                stock: Number(form.stock),
                images: photos,
                image: photos[0],
                contactPhone: form.contactPhone,
            }, authHeaders());
            setForm({ ...emptyForm, contactPhone: form.contactPhone });
            setDone(true);
            setTimeout(() => setDone(false), 4000);
            loadListings();
        } catch (err) {
            setError('Something went wrong while saving. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const markSoldOut = async (id) => {
        await axios.put(`${API_BASE_URL}/api/products/${id}`, { stock: 0 }, authHeaders());
        loadListings();
    };

    const backInStock = async (id) => {
        await axios.put(`${API_BASE_URL}/api/products/${id}`, { stock: 1 }, authHeaders());
        loadListings();
    };

    const remove = async (id) => {
        if (!window.confirm('Remove this listing?')) return;
        await axios.delete(`${API_BASE_URL}/api/products/${id}`, authHeaders());
        loadListings();
    };

    const input = "w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition";

    return (
        <div className="bg-light min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-dark tracking-tight flex items-center gap-3">
                        <Store className="w-8 h-8 text-amber-500" /> Sell on Immanuel's Store
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Got something to sell? Add it below and shoppers can find it right away.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Listing form */}
                    <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-5">
                        <h2 className="text-xl font-bold text-dark">List a new item</h2>

                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">What are you selling?</label>
                            <input name="name" value={form.name} onChange={change} required placeholder="e.g. Handmade beaded earrings" className={input} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Category</label>
                                <input name="category" value={form.category} onChange={change} required list="category-ideas" placeholder="Pick or type your own" className={input} />
                                <datalist id="category-ideas">
                                    {CATEGORY_IDEAS.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Price (KSh)</label>
                                <input name="price" type="number" min="1" value={form.price} onChange={change} required placeholder="1500" className={input} />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">How many do you have?</label>
                                <input name="stock" type="number" min="1" value={form.stock} onChange={change} required className={input} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Your WhatsApp / phone</label>
                                <input name="contactPhone" value={form.contactPhone} onChange={change} placeholder="0712 345 678" className={input} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Tell buyers about it</label>
                            <textarea name="description" value={form.description} onChange={change} rows={4} placeholder="Size, colour, condition, where to pick it up..." className={input} />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-amber-500" /> Photo links
                            </label>
                            <textarea name="photos" value={form.photos} onChange={change} rows={3} placeholder={"Paste one image link per line\nhttps://..."} className={input} />
                            <p className="text-xs text-gray-400 mt-2">The first link is the main photo. Direct photo uploads are coming soon.</p>
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        {done && (
                            <p className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                                <CheckCircle className="w-5 h-5" /> Your item is live! <Link to="/shop" className="underline">See it in the shop</Link>
                            </p>
                        )}

                        <button type="submit" disabled={saving} className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60">
                            {saving ? 'Posting...' : 'Post my item'}
                        </button>
                    </form>

                    {/* My listings */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-dark mb-4">My listings ({listings.length})</h2>
                        {listings.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-8 text-center text-gray-400 border border-dashed border-gray-200">
                                <p className="font-semibold text-dark mb-1">Nothing here yet</p>
                                <p className="text-sm">Items you post will show up here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {listings.map(item => (
                                    <div key={item._id} className="bg-white rounded-2xl p-3 flex gap-3 items-center border border-gray-100 shadow-sm">
                                        <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <Link to={`/product/${item._id}`} className="font-bold text-dark text-sm block truncate hover:text-primary">{item.name}</Link>
                                            <p className="text-sm text-primary font-semibold">KSh {item.sellPrice || item.price}</p>
                                            <p className={`text-xs ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.stock > 0 ? `${item.stock} available` : 'Sold out'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            {item.stock > 0 ? (
                                                <button onClick={() => markSoldOut(item._id)} title="Mark as sold out" className="p-2 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"><PackageX className="w-4 h-4" /></button>
                                            ) : (
                                                <button onClick={() => backInStock(item._id)} title="Back in stock" className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition"><CheckCircle className="w-4 h-4" /></button>
                                            )}
                                            <button onClick={() => remove(item._id)} title="Remove" className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sell;
