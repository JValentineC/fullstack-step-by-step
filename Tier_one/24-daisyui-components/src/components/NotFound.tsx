import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <p>
          <Link to="/">Go back home</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}

export default NotFound
