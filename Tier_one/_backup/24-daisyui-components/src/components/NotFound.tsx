import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <p>
          <Link to="/">Go back home</Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default NotFound
