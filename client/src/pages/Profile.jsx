import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { app } from "../firebase.js";
import {
    updateUserFailure,
    updateUserStart,
    updateUserSuccess,
    resetUserSession
} from "../redux/user/userSlice.js";
import {useNavigate} from "react-router-dom";

function Profile(props) {
    const { currentUser } = useSelector(state => state.user);
    const fileRef = useRef(null);
    const [ file, setFile ] = useState(undefined);
    const [ uploadPercentage, setUploadPercentage ] = useState(0);
    const [ fileUploadError, setFileUploadError ] = useState(false);
    const [ formData, setFormData ] = useState({});
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [ updateSuccess, setUpdateSuccess ] = useState(false);

    useEffect(()=> {
        if (file) {
            handleFileUpload(file);
        }
    }, [file])

    const handleFileUpload = () => {
        const storage  = getStorage(app);
        const fileName = new Date().getTime()+file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) =>{
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                setUploadPercentage(Math.round(progress));
            },
            () =>{
                setFileUploadError(true)
            },
            () =>{
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setFormData({...formData, avatar: downloadURL})
                })
            });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            dispatch(updateUserStart());
            const res =  await fetch(`api/user/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.status === 401) {
                dispatch(resetUserSession())
                navigate('/sign-in')
                return;
            }
            const data = await res.json();
            if (!data.success) {
                dispatch(updateUserFailure(data.message));
                return;
            }

            dispatch(updateUserSuccess(data.data));
            setUpdateSuccess(true);
        } catch (e) {
            dispatch(updateUserFailure(e.message))
        }
    }

    return (
        <div
            className='p-3 max-w-lg mx-auto'>
            <h1
                className='text-3xl font-semibold text-center my-7'>
                Profile
            </h1>
            <form
                onSubmit={handleSubmit}
                className='flex flex-col gap-4'>
                <input
                    onChange={e => setFile(e.target.files[0])}
                    type='file' ref={fileRef}
                    hidden
                    accept='image/*'
                />
                <img
                    onClick={() => fileRef.current.click()}
                    src={formData.avatar||currentUser.avatar}
                    alt='profile'
                    className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
                <p
                    className='text-sm text-center'>
                    {
                        fileUploadError
                            ?
                            <span className='text-red-700'>Error image upload (image must be less than 2MB)</span>
                            :
                            uploadPercentage > 0 && uploadPercentage < 100
                                ?
                                <span className='text-slate-700'>{`Uploading ${uploadPercentage}%`}</span>
                                :
                                uploadPercentage === 100
                                    ?
                                    (<span className='text-green-700'>{`Upload completed`}</span>)
                                    :
                                    ""
                    }
                </p>
                <input
                    type='text'
                    placeholder='username'
                    className='border p-3 rounded-lg'
                    id='username'
                    defaultValue={currentUser.username}
                    onChange={handleChange}
                />
                <input
                    type='email'
                    placeholder='email'
                    className='border p-3 rounded-lg'
                    id='email'
                    defaultValue={currentUser.email}
                    onChange={handleChange}
                />
                <input
                    type='password'
                    placeholder='password'
                    className='border p-3 rounded-lg'
                    id='password'
                    defaultValue={currentUser.password}
                    onChange={handleChange}
                />
                <button
                    disabled={loading}
                    className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:bg-opacity-60'>
                    {loading ? 'Loading ... ': 'Update'}
                </button>
            </form>
            <div
                className='flex justify-between mt-5'>
                <span
                    className='text-red-700 cursor-pointer'>
                    Delete Account
                </span>
                <span
                    className='text-red-700 cursor-pointer'>
                    Sign Out
                </span>
            </div>
            <p
            className='text-red-700'>
                {
                    error ? error : ''
                }
            </p>
            <p className='text-green-700'>
                {
                    updateSuccess ? 'Successfully updated' : ''
                }
            </p>
        </div>
    );
}

export default Profile;
