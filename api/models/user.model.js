import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true,
  },
  avatar:{
    type: String,
    default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-profile-picture&psig=AOvVaw0xRnipfl6N5mqXsckBLovk&ust=1697844246906000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCOi77uugg4IDFQAAAAAdAAAAABAE",
  },
}, {timestamps: true})


const User = mongoose.model('User', userSchema);

export default User;
