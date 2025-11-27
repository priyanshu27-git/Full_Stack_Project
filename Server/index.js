let express = require('express');
const bcrypt = require("bcrypt");
const Auth = require("./Auth");
let mongoose = require('mongoose');
let User = require('./User');
let Upload = require('./Upload');
let jwt = require('jsonwebtoken');
let cors = require('cors');
mongoose.connect('mongodb://127.0.0.1:27017/insta').then(() => {
    console.log("db...");
})
let app = express()
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send("hello");
})

app.post("/signUp", async (req, res) => {
    try {
        const { name, email, passWord } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(passWord, 10);
        const newUser = new User({ name, email, passWord: hashedPassword });
        await newUser.save();

        res.json({ msg: "Signup successful", user: newUser });
    } catch (err) {
        return res.status(500).json({ msg: "Error during signup", error: err.message });
    }
});

app.post("/login", async (req, res) => {
    let { email, passWord } = req.body
    console.log(email, passWord);

    let userInfo = await User.findOne({ email })
    console.log(userInfo, "kyaa milegaaaaaaaa");

    if (!userInfo) {
        res.send("user not found")
    } else {
        let validPass = await bcrypt.compare(passWord, userInfo.passWord,)
        if (validPass) {
            let token = jwt.sign(
                { id: userInfo._id, email: userInfo.email, role: userInfo.role },
                "JHBFIUWBFIUWB"
            );

            console.log(token, "tokennnnn");

            res.json({ token: token })
        } else {
            res.send("pass sahi nhi haiiii")
        }
    }

})


//--Upload
app.post("/upload", Auth, async (req, res) => {


    const { imgUrl } = req.body;
    const userId = req.user.id;
    if (!imgUrl) {
        return res.send("URL not found")
    }
    let uploadD = new Upload({
        imgUrl,
        user: userId,
        likedBy: [],
    })
    await uploadD.save();
    return res.send("uploaded");
})


app.get("/upload", async (req, res) => {
    try {
        const images = await Upload.find();
        res.json(images);
    } catch (err) {
        console.error("Error fetching images:", err.message);
        return res.status(500).json({ msg: "Error fetching images", error: err.message });
    }
});

app.post('/like/:id', Auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id; // decode se niakala

        const post = await Upload.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });


        post.likedBy = post.likedBy.filter(id => id !== null);


        const alreadyLiked = post.likedBy.some(
            id => id.toString() === userId.toString()
        );

        // --------------------------------
        // 🔴 UNLIKE (agar like kiya hua hai)
        // --------------------------------
        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
            post.likeCount = Math.max(0, post.likeCount - 1);

            await post.save();
            return res.json({
                success: true,
                message: "Disliked",
                likeCount: post.likeCount
            });
        }

        // --------------------------------
        // 🟢 LIKE (agar pehle like nahi kiya)
        // --------------------------------
        post.likedBy.push(userId);
        post.likeCount += 1;

        await post.save();
        return res.json({
            success: true,
            message: "Liked",
            likeCount: post.likeCount
        });

    } catch (err) {
        console.log("LIKE API ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/follow/:id', Auth, async (req, res) => {
    let targetUserId = req.params.id;
    let currentUserId = req.user.id;
    // console.log(req.user);

    if (targetUserId === currentUserId) {
        res.json({ msg: "Khudko follow kyu kar raha hai bhai..." })
    }
    let targetUser = await User.findById(targetUserId);
    let currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
        return res.status(404).json({ msg: "User hai hi nahi " });
    }
    let alreadyFollowing = currentUser.following.includes(targetUserId);
    if (alreadyFollowing) {
        currentUser.following = currentUser.following.filter(id => {
            return id.toString() !== targetUserId.toString();
        });
        targetUser.followers = targetUser.followers.filter(id => {
            return id.toString() !== currentUserId.toString();
        });

        await currentUser.save();
        await targetUser.save();

        return res.json({
            success: true,
            msg: "Unfollowed successfully"
        });
    }

    //followers
    currentUser.following.push(targetUserId)
    targetUser.followers.push(currentUserId);
    await currentUser.save()
    await targetUser.save()

   res.json({msg:"followed succe......"})

});

app.listen(4000, () => {
    console.log("Server is running ")
})
