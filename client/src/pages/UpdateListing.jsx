import {useEffect, useState} from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function UpdateListing() {
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const [ files, setFiles ] = useState([]);
    const [ formData, setFormData ] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });

    const [ imageUploadError, setImageUploadError ] = useState(null);
    const [ uploading, setUploading ] = useState(false);
    const [ error, setError ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const params = useParams();

    useEffect(() => {
        const fetchListing = async () => {
            const listingId = params.listingId;
            const res = await fetch(`/api/listing/${listingId}`, {
                method: 'GET',
            })

            const data = await res.json();
            if (!data.success) {
                console.log(data.message)
                return;
            }
            setFormData(data.data)
        }

        fetchListing()
    }, []);
    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length < 7 && formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(null);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }

            Promise.all(promises).then(urls => {
                setFormData(
                    {
                        ...formData,
                        imageUrls: formData.imageUrls.concat(urls)
                    });
                setImageUploadError(null);
                setUploading(false);
            }).catch(e => {
                setImageUploadError('Image upload failed (2 MB max per image)');
                setUploading(false);
            });
        } else {
            setImageUploadError('You can only upload up to 6 images per listing.');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime()+file.name;
            const storageRef = ref(storage, fileName);

            const uploadTask = uploadBytesResumable(storageRef,file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    console.log(`Upload is ${progress}%`)
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                        resolve(downloadUrl);
                    })
                }
            )
        })
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });

        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleChange = (e) => {
        if (e.target.id === 'sell' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id
            })
        }

        if (e.target.id === 'parking' || e.target.id === 'offer' || e.target.id === 'furnished') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
            })
        }

        if (e.target.type === 'number') {
            setFormData({
                ...formData,
                [e.target.id]: isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value),
            })
        }

        if (e.target.type === 'textarea' || e.target.type === 'text') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (+formData.regularPrice < +formData.discountPrice) return setError('Regular price must be greater than discount price');
            if (formData.imageUrls.length < 1) return setError('You must upload at least one image');
            setLoading(true);
            setError(false);
            const listingId = params.listingId
            const res = await fetch(`/api/listing/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            })

            const data = await res.json();

            setLoading(false);
            if (!data.success) {
                setError(data.message)
                return;
            }
            // TODO: please change the path later
            navigate(`/update-listing/${listingId}`)
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }
    return (
        <main
            className='p-3 max-w-6xl mx-auto'>
            <h1
                className='text-3xl font-semibold text-center my-7'>
                Update Listing
            </h1>
            <form
                onSubmit={handleSubmit}
                className='flex flex-col sm:flex-row gap-4'>
                <div
                    className='flex flex-col gap-4 flex-1'>
                    <input
                        onChange={handleChange}
                        value={formData.name}
                        type='text'
                        placeholder='name'
                        className='border p-3 rounded-lg'
                        id='name'
                        maxLength='62'
                        minLength='10'
                        required/>
                    <textarea
                        onChange={handleChange}
                        value={formData.description}
                        placeholder='description'
                        className='border p-3 rounded-lg'
                        id='description'
                        required/>
                    <input
                        onChange={handleChange}
                        value={formData.address}
                        type='text'
                        placeholder='address'
                        className='border p-3 rounded-lg'
                        id='address'
                        required/>
                    <div
                        className='flex gap-6 flex-wrap'>
                        <div
                            className='flex gap-2'>
                            <input
                                checked={formData.type === 'sell'}
                                onChange={handleChange}
                                type='checkbox'
                                className='w-5'
                                id='sell'/>
                            <span
                                className=''>
                                Sell
                            </span>
                        </div>
                        <div
                            className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={formData.type === 'rent'}
                                type='checkbox'
                                className='w-5' id='rent'/>
                            <span
                                className=''>
                                Rent
                            </span>
                        </div>
                        <div
                            className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={formData.parking}
                                type='checkbox'
                                className='w-5' id='parking'/>
                            <span
                                className=''>
                                Parking
                            </span>
                        </div>
                        <div
                            className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={formData.furnished}
                                type='checkbox'
                                className='w-5'
                                id='furnished'/>
                            <span
                                className=''>
                                Furnished
                            </span>
                        </div>
                        <div
                            className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={formData.offer}
                                type='checkbox'
                                className='w-5'
                                id='offer'/>
                            <span
                                className=''>
                                Offer
                            </span>
                        </div>
                    </div>
                    <div
                        className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2'>
                            <input onChange={handleChange} value={formData.bedrooms} className='p-3 border border-gray-300 rounded-lg' type='number' id='bedrooms' min='1' max='10' required/>
                            <p>Beds</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input onChange={handleChange} value={formData.bathrooms} className='p-3 border border-gray-300 rounded-lg' type='number' id='bathrooms' min='1' max='10' required/>
                            <p>Baths</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input onChange={handleChange} value={formData.regularPrice} className='p-3 border border-gray-300 rounded-lg' type='number' min='50' max='1000000' id='regularPrice' required/>
                            <div className='flex flex-col items-center'>
                                <p>Regular Price</p>
                                <span className='text-xs'>($ / month)</span>
                            </div>

                        </div>
                        {
                            formData.offer && (
                                <div className='flex items-center gap-2'>
                                    <input onChange={handleChange} value={formData.discountPrice} className='p-3 border border-gray-300 rounded-lg' type='number' min='0' max='1000000' id='discountPrice'/>
                                    <div className='flex flex-col items-center'>
                                        <p>Discount Price</p>
                                        <span className='text-xs'>($ / month)</span>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div
                    className='flex flex-col flex-1 gap-4'>
                    <p
                        className='font-semibold '>
                        Images:
                        <span
                            className='font-normal text-gray-600 ml-2'>
                            The first image will be the cover (max 6)
                        </span>
                    </p>
                    <div
                        className='flex gap-4'>
                        <input
                            onChange={(e) => setFiles(Array.from(e.target.files))}
                            className='p-3 border border-gray-300 rounded w-full'
                            type='file'
                            id='images'
                            accept='image/*'
                            multiple/>
                        <button
                            disabled={uploading}
                            type='button'
                            onClick={handleImageSubmit}
                            className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-70'>
                            {
                                uploading
                                    ?
                                    'Uploading...'
                                    :
                                    'Upload'
                            }
                        </button>
                    </div>
                    <p className='text-red-700 text-sm text-center'>
                        {
                            imageUploadError && imageUploadError
                        }
                    </p>
                    {
                        formData.imageUrls.length > 0 && formData.imageUrls.map((url, idx) => (
                                <div className='flex justify-between p-3 border items-center' key={`${idx}`}>
                                    <img src={url} alt='listing-image' className='w-20 h-20 object-contain rounded-lg' />
                                    <button type='button' onClick={() => handleRemoveImage(idx)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>Delete</button>
                                </div>
                            )
                        )
                    }
                    <button
                        disabled={ loading || uploading }
                        className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-70'>
                        {
                            loading
                                ?
                                'Updating...'
                                :
                                'Update Listing'
                        }
                    </button>
                    <p className='text-red-700 text-sm text-center'>
                        {
                            error && <p className='text-red-700 text-sm'>{error}</p>
                        }
                    </p>
                </div>
            </form>
        </main>
    );
}

export default UpdateListing;
