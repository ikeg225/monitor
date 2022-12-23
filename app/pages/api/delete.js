import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = await client.db('keywordmonitor');
    const { twitter, reddit, hackernews, lobster, keywords, email } = req.body;

    try {
        const all = await db.collection('all')
        const result = await all.findOne({ email: email })

        if (result && keywords.trim() === "$all" && twitter && reddit && hackernews && lobster) {
            Object.keys(result).forEach(async function(key) {
                if (key !== "_id" && key !== "email") {
                    const collection = await db.collection(key)
                    result[key].forEach(async keyword => {
                        const updated_fields = await collection.findOneAndUpdate({ keyword: keyword }, { $pull: { email: email } }, { returnDocument: 'after' })
                        if (updated_fields['value']['email'].length === 0) {
                            await collection.deleteOne({ keyword: keyword })
                        }
                    })
                }
            });
            await all.deleteOne({ email: email })
            res.status(200).json({ success: true })
        } else if (result) {
            Object.keys(result).forEach(async function(key) {
                if (key !== "_id" && key !== "email" && (key === "twitter" && twitter || key === "reddit" && reddit || key === "hackernews" && hackernews || key === "lobster" && lobster)) {
                    const collection = await db.collection(key)
                    keywords.split(',').forEach(async keyword => {
                        keyword = keyword.trim()
                        if (keyword !== '') {
                            const remove_count = await all.updateOne({ email: email }, { $pull: { [key]: keyword } })
                            if (remove_count['modifiedCount'] == 1) {
                                const updated_fields = await collection.findOneAndUpdate({ keyword: keyword }, { $pull: { email: email } }, { returnDocument: 'after' })
                                if (updated_fields['value']['email'].length === 0) {
                                    await collection.deleteOne({ keyword: keyword })
                                }
                            }
                        }
                    })
                }
            })

            // async function deleteKeys() {
            //     await removeKeywords().then(async () => {
            //         const updated_result = await all.findOne({ email: email })
            //         let count_keys = 0;
            //         let count_removed = 0;
            //         Object.keys(updated_result).forEach(function(key) {
            //             if (key !== "_id" && key !== "email") {
            //                 count_keys += 1
            //                 if (updated_result[key].length === 0) {
            //                     count_removed += 1
            //                     all.updateOne({ email: email }, { $unset: { [key]: "" } })
            //                 }
            //             }
            //         });
            //         console.log(count_keys, count_removed)
            //         return count_keys - count_removed    
            //     })
            // }

            // async function deleteEmail() {
            //     const count_difference = await deleteKeys();

            //     console.log(count_difference)
            //     if (count_difference === 0) {
            //         all.deleteOne({ email: email })
            //     }
            // }
            
            // deleteEmail()
            res.status(200).json({ success: true })
        } else {
            res.status(400).json({ error: 'Email address invalid' })
        }
    } catch (err) {
        res.status(400).json(err)
    }
}