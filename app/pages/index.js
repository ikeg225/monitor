import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { signIn } from 'next-auth/react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from "next-auth/react"

export default function Home() {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const router = useRouter();
  const [signinError, setSigninError] = useState('');

  async function submitHandler(event) {
    event.preventDefault();

    setSigninError('');

    const enteredEmail = emailInputRef.current.value.toLowerCase();
    const enteredPassword = passwordInputRef.current.value;

    // optional: Add validation
    const result = await signIn('credentials', {
      redirect: false,
      email: enteredEmail,
      password: enteredPassword,
    });
    
    if (!result.error) {
      // set some auth state
      router.replace('/twitter-analyzer');
    } else {
      setSigninError(result.error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Login</title>
      </Head>
      <img src="/logo.png" alt="logo" className={styles.logo} />
      <div className={styles.login}>
        <h1>Login</h1>
        <form onSubmit={submitHandler} className={styles.fields}>
          <div className={styles.control}>
            <label htmlFor='email'>Your Email</label>
            <input type='email' id='email' required ref={emailInputRef}/>
          </div>
          <div className={styles.control}>
            <label htmlFor='password'>Your Password</label>
            <input
              type='password'
              id='password'
              required
              ref={passwordInputRef}
            />
          </div>
          {signinError && <p className={styles.error}>{signinError}</p>}
          <div className={styles.actions}>
            <button type="submit">Continue</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (session) {
      return {
          redirect: {
              destination: '/twitter-analyzer',
              permanent: false,
          },
      };
  }
  return {
      props: { session },
  };
}