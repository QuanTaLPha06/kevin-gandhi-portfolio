export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="prose max-w-none">
        <h2>Portfolio Owner Information</h2>
        <p><strong>Name:</strong> Kevin Gandhi</p>
        <p><strong>Title:</strong> Full Stack & Software Engineer</p>
        <p><strong>Tagline:</strong> <em>"I build practical applications that go beyond prototypes and deliver real-world impact."</em></p>

        <hr />

        <h2>Personal Profile & About</h2>
        <h3>About Me:</h3>
        <p>"I’m Kevin Gandhi — a software developer focused on building deployable, production-ready systems. I specialize in web apps, full-stack architectures, and scalable cloud solutions."</p>
        <p>"My work spans full-stack development, modern web applications, REST APIs, and database engineering. I believe software is only successful when it solves real user problems smoothly."</p>
        <p>"I work with curiosity, speed, and product-thinking: every project I build must solve a real problem and make someone's workflow better."</p>

        <hr />

        <h2>Social Links & Contact</h2>
        <ul>
          <li><strong>GitHub:</strong> github.com/QuanTaLPha06</li>
          <li><strong>Email:</strong> kevingandhi.work@gmail.com</li>
          <li><strong>Portfolio:</strong> (after deployment add URL)</li>
        </ul>

        <hr />

        <h2>Skills & Technologies</h2>
        <h3>Core Skills:</h3>
        <p>Full Stack Development • REST APIs • Cloud Deployment • Next.js • React • Node.js • Databases</p>

        <hr />

        <footer className="mt-8 text-center text-gray-500">
          <p>&copy; 2026 Kevin Gandhi. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}