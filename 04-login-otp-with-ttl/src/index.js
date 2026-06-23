import express from 'express'

import Redis from 'ioredis';

const app = express();

app.use(express.json());

const redis = new Redis(
    process.env.REDISURL_URL || 'redis://localhost:6379'
)

function otpKey(phone){
    return `otp:${phone}`;
}

app.post('/otp',async (req,res) =>{
    const {phone} = req.body;

    const otp = Math.floor(100000+Math.random()*900000).toString();
    res.json({success:true});

    await redis.set(otpKey(phone), otp, 'EX', 30);  //otp valid for 30sec

    res.json({message:'OTP sent',otp});

})

app.post('otp/verify', async(req,res)=>{
    const {phone,otp}= req.body;
    const savedOtp = await redis.get(otpKey(phone));

    if(savedOtp!==otp){
        return res.status(400).json({message:"invalid otp"})
    }

    await redis.del(otpKey(phone));
    res.json({message:"otp verififed successfully"});


})

app.get('/otp/:phone/ttl',async(req,res)=>{
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ttl});
});

app.listen(3000,()=>{
    console.log("Server running on port http://localhost:3000")
})