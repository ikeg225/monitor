export default async function handler(req, res) {
    var TwitterAdsAPI = require('twitter-ads');
    var T = new TwitterAdsAPI({
        consumer_key: process.env.APIKEY,
        consumer_secret: process.env.APIKEYSECRET,
        access_token: process.env.ACCESSTOKEN,
        access_token_secret: process.env.ACCESSTOKENSECRET,
        api_version: '12'
    });
      
    let date = new Date(req.body.request.params.date)
    let end = new Date(date)
    end.setDate(end.getDate() - 7)
    const returnData = []

    await new Promise(function(resolve, reject) { 
        T.get(`insights/keywords/search?end_time=${date.toISOString().split('T')[0]}&granularity=DAY&keywords=${req.body.request.params.keyword}&start_time=${end.toISOString().split('T')[0]}`, function(error, resp, body) {
            returnData.push(body)
            resolve('done')
        })
    })

    let volume_first_half = 0
    let volume_second_half = 0

    for (let i = 0; i < returnData[0].data.tweet_volume.length; i++) {
        if (i < 7 / 2) {
            volume_first_half += returnData[0].data.tweet_volume[i]
        } else {
            volume_second_half += returnData[0].data.tweet_volume[i]
        }
    }

    const data = {
        "related_keywords": returnData[0].data.related_keywords,
        "volume_first_half": volume_first_half,
        "volume_second_half": volume_second_half
    }

    res.status(200).json(data)
}