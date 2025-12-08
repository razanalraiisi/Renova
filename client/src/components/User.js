import { useSelector } from 'react-redux';

const User=()=>{
    const uname=useSelector((state)=>state.users.user.uname);
    const profilepic=useSelector((state)=>state.users.user.profilepic);
    const defPic="https://icon-library.com/images/profiles-icon/profiles-icon-0.jpg";
    return(
        <>
            <img src={profilepic?profilepic:defPic} className='profilepic'/>
            <h1>{uname}</h1>
        </>
    )
}
export default User;