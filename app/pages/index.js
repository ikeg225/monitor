import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (e.target.value != ''){            
      const data = {
          course: courseSelect,
          discord: e.target[0].value
      }

      const JSONdata = JSON.stringify(data);
      const endpoint = '/api/updatediscord';

      const options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSONdata
      }

      await fetch(endpoint, options).catch(err => console.log(err))
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Keyword Monitor</title>
        <meta name="description" content="Add users to Keyword Monitor Database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form onSubmit={handleSubmit}>
        <input type="checkbox" id="twitter" name="twitter" />
        <label for="scales">Twitter</label>
        <input type="checkbox" id="reddit" name="reddit" />
        <label for="scales">Reddit</label>
        <input type="checkbox" id="hackernews" name="hackernews" />
        <label for="scales">Hacker News</label>
        <input type="checkbox" id="lobster" name="lobster" />
        <label for="scales">Lobste.rs</label>
        <input type="text" placeholder="enter the keyword..."/>
        <input type="text" placeholder="enter the email to notify..."/>
        <button type="submit">Add Keyword and Email</button>
      </form>
    </div>
  )
}
