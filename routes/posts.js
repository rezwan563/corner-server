const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User")

// create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    await newPost.save();
    res.status(200).json("posted succesffully");
  } catch (err) {
    res.status(500).json(err);
  }
});
// update post
router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  console.log(post);
  if (post.userId.includes(req.body.userId)) {
    await Post.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.status(200).json("post updated successfully");
  } else {
    res.status(403).json("you can only update your post");
  }
});
// delete post
router.delete("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post.userId.includes(req.body.userId)) {
    try {
      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json("post deleted successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you can only delete your post");
  }
});
// like/dislike a post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("you liked the post");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("you disliked the post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
// get timeline post
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => Post.find({ userId: friendId }))
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
