export default async function handler(req, res) {
    var TwitterAdsAPI = require('twitter-ads');
    var T = new TwitterAdsAPI({
        consumer_key: process.env.APIKEY,
        consumer_secret: process.env.APIKEYSECRET,
        access_token: process.env.ACCESSTOKEN,
        access_token_secret: process.env.ACCESSTOKENSECRET,
        api_version: '12'
    });
      
    let start_time = new Date(req.body.request.params.start_time)
    let end_time = new Date(req.body.request.params.end_time)
    const diffTime = Math.abs(end_time - start_time) / (1000 * 3600 * 24);
    const returnData = []

    while (start_time < end_time) {
        let temp_end = new Date(start_time)
        temp_end.setDate(temp_end.getDate() + 7)
        if (temp_end > end_time) {
            temp_end = end_time
        }

        const endString = temp_end.toISOString().split('T')[0]
        const startString = start_time.toISOString().split('T')[0]
        
        await new Promise(function(resolve, reject) { 
            T.get(`insights/keywords/search?end_time=${endString}&granularity=DAY&keywords=${req.body.request.params.keyword}&start_time=${startString}`, function(error, resp, body) {
                returnData.push(body)
                resolve('done')
            })
        })

        start_time = temp_end
    }

    const related_keywords = new Set()
    const graph_data = []
    let volume_first_half = 0
    let volume_second_half = 0
    let offset = 0
    returnData.forEach(item => {
        let time_in_index = new Date(item.request.params.start_time)
        item.data.related_keywords.forEach((keyword) => {
            related_keywords.add(keyword)
        })

        for (let i = 0; i < item.data.tweet_volume.length; i++) {
            graph_data.push({
                "date": time_in_index.toISOString().split('T')[0],
                "volume": item.data.tweet_volume[i]
            })
            time_in_index.setDate(time_in_index.getDate() + 1)
            if (i + offset < diffTime / 2) {
                volume_first_half += item.data.tweet_volume[i]
            } else {
                volume_second_half += item.data.tweet_volume[i]
            }
        }

        offset += item.data.tweet_volume.length
    })

    const data = {
        "related_keywords": Array.from(related_keywords),
        "graph_data": graph_data,
        "volume_first_half": volume_first_half,
        "volume_second_half": volume_second_half,
        "number_of_tweets": offset
    }

    res.status(200).json(data)
}