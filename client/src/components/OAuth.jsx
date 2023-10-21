import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from "../firebase.js";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice.js";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app)

            const result = await signInWithPopup(auth, provider)

            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                })
            })

            const data = await res.json();
            dispatch(signInSuccess(data.data));
            navigate('/')
        } catch (e) {
           console.log('Could not connect to Google')
        }
    }
    return (
        <button
            onClick={handleGoogleClick}
            type='button'
            className='flex justify-center gap-2 bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-80'>
            <FcGoogle className="text-2xl"/>
            Continue With Google
        </button>
    );
}

export default OAuth;
