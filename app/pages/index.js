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
      <div className={styles.login}>
        <div className={styles.loginLeft}>
          <h1>Twitter Analysis Login</h1>
          <p>Please Login below...</p>
          <form onSubmit={submitHandler}>
            <div className={styles.fields}>
              <div className={styles.control}>
                <input type='email' id='email' required ref={emailInputRef} placeholder='Your Email'/>
              </div>
              <div className={styles.control}>
                <input
                  type='password'
                  id='password'
                  required
                  ref={passwordInputRef}
                  placeholder='Your Password'
                />
              </div>
            </div>
            {signinError && <p className={styles.error}>{signinError}</p>}
            <div className={styles.actions}>
              <button type="submit">Login</button>
            </div>
          </form>
        </div>
        <img src="/login.jpg" alt="" />
      </div>
      <p className={styles.copyright}>&copy; 2023 ScreamOutSocial.com. All rights reserved.</p>
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