import styles from '../styles/TwitterAnalyzer.module.css'
import { useState } from 'react'
import { signOut, getSession } from "next-auth/react"

export default function TwitterAnalyzer() {
  const [relatedKeywords, setRelatedKeywords] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [tweets, setTweets] = useState([])
  const [keyword, setKeyowrd] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setRelatedKeywords([])
    setAnalytics([])
    setTweets([])
    setKeyowrd('')

    const keyword_field = e.target[0].value.toLowerCase().trim().replace('#', '').replace('@', '')
    setKeyowrd(keyword_field)

    const data = {
      "request": {
        "params": {
          "keyword": keyword_field
        }
      }
    }

    const JSONdata = JSON.stringify(data);
    const endpoint = '/api/twitterAnalyzer';

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    }).then(async res => {
      const data = await res.json()
      setRelatedKeywords(data.related_keywords)
      setAnalytics([data.volume_first_half + data.volume_second_half, 
        ((data.volume_first_half + data.volume_second_half) / 7).toFixed(2),
      (((data.volume_second_half - data.volume_first_half) / data.volume_first_half) * 100).toFixed(2)
      ])
    })

    const endpoint2 = '/api/tweets';
    await fetch(endpoint2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    }).then(async res => {
      const data = await res.json()
      setTweets(data.data)
    })
  }
  return (
    <div className={styles.content}>
      <img src="/logo.png" alt="logo" className={styles.logo} />
      <div className={styles.analyzer}>
        <div className={styles.header}>
          <h1>Twitter Analyzer</h1>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
        <p>Use broad search or "" for phrase match.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.input}>
            <div className={styles.leftInput}>
              <img src="/keyword.png" alt="" className={styles.image}/>
              <h3>Keyword</h3>
            </div>
            <input type="text" name="keywords" required/>
          </label>
          <input type="submit" value="Submit" />
        </form>
        {analytics.length !== 0 && <div>
          <h2>Analytics: Previous 7 Days</h2>
          <table className={styles.analytics}>
            <tr>
              <td className={styles.first}>Total Volume</td>
              <td className={styles.second}>{analytics[0]}</td>
            </tr>
            <tr>
              <td className={styles.first}>Avg. Volume Per Day</td>
              <td className={styles.second}>{analytics[1]}</td>
            </tr>
            <tr>
              <td className={styles.first}>Trend</td>
              <td className={styles.second}>{analytics[2]}%</td>
            </tr>
          </table>
        </div>}
        {relatedKeywords.length !== 0 && <div>
          <h2>Related Keywords</h2>
          <div className={styles.keywords}>
            {relatedKeywords.map((keyword, index) => {
              return <p key={index} className={styles.keyword}>{keyword}</p>
            })}
          </div>
        </div>}
        {tweets.length !== 0 && <div>
          <h2>Top Tweets</h2>
          <div className={styles.tweets}>
            {tweets.map((tweet, index) => {
              let cleaned_keyword = [keyword]
              if (cleaned_keyword[0].includes('"')) {
                cleaned_keyword[0] = keyword.replaceAll('"', '')
              } else {
                cleaned_keyword = cleaned_keyword[0].split(" ")
              }

              let contains = false
              cleaned_keyword.forEach(keyword => {
                if (tweet.text.includes(keyword)) {
                  contains = true
                }
              })

              return contains ? <div className={styles.tweet} key={index}>
                <a href={`https://twitter.com/_/status/${tweet.id}`} target="_blank" rel="noreferrer">{`https://twitter.com/_/status/${tweet.id}`}</a>
                <p>{tweet.text}</p>
              </div> : null
            })}
          </div>
        </div>}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
      return {
          redirect: {
              destination: '/',
              permanent: false,
          },
      };
  }
  return {
      props: { session },
  };
}