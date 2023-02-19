import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = await client.db('clients');
    const { email, rule, responseSpintax } = req.body;
    const autoPost = await db.collection('autoPost');

    const found = await autoPost.findOne({ email: email });
    if (found && found["rules"].length >= 25) {
        res.status(400).json({ error: "You have reached the maximum number of rules" })
        return
    }

    try {
        await autoPost.updateOne({ email: email }, { $addToSet: { rules: [rule, responseSpintax, (new Date()).toISOString()] } }, { upsert: true })
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(400).json(err)
    }
}