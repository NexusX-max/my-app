// routes/musicRoutes.js
router.get('/trending', async (req, res) => {
  try {
    const musicFeed = await Music.find().sort({ popularity: -1 }).limit(20);
    res.json({ success: true, data: musicFeed });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});