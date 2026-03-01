function AboutSection() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-3xl font-bold mb-4">Jonathan Ramirez — Tech Fellow @ i.c.Stars</h2>
        <p className="text-lg leading-relaxed mb-4">
          Hello! I&apos;m Jonathan Ramirez, a proud graduate of{' '}
          <a href="https://www.icstars.org/" target="_blank" rel="noopener noreferrer" className="link link-primary">i.c.Stars</a>{' '}
          Cycle 53 and a lifelong builder, teacher, and learner.
        </p>
        <p className="mb-4">
          My path into tech wasn&apos;t traditional — I left high school early and earned my GED in
          2023, the same year I joined i.c.Stars. That experience — starting again, showing up every
          day, and doing the hard things — shaped how I learn, how I lead, and how I support others
          who are breaking into tech.
        </p>
        <p className="mb-4">
          After graduating, I served as a <strong>Program Manager at United Airlines</strong> on a
          contract engagement. When that ended, I doubled down on self-learning — strengthening my
          skills across full-stack development, product thinking, leadership, and mentoring.
        </p>
        <p>
          Today, I&apos;m back where my journey accelerated — as a{' '}
          <strong>Tech Fellow at i.c.Stars</strong> — helping interns reach their potential and
          supporting facilitators and the program team however I can.
        </p>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-3">What I Believe</h3>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Starting lines matter more than finish lines.</strong> Take the first step, then the next one.</li>
          <li><strong>Clarity beats cleverness.</strong> Simple, readable code wins.</li>
          <li><strong>Progress compounds.</strong> A little better every day turns into a lot.</li>
          <li><strong>Community lifts us higher.</strong> We learn faster together — ask questions, help someone else, repeat.</li>
        </ul>
      </section>

      <section className="bg-base-200 rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-3">Invitation</h3>
        <p className="mb-4">
          I built this for people like us — people who may not have had a straight path into tech
          but who have the grit to keep going. If that&apos;s you, welcome.
        </p>
        <p className="mb-4">
          And if you know someone whose life could change with the right community and the right
          challenge, point them to{' '}
          <a href="https://www.icstars.org/" target="_blank" rel="noopener noreferrer" className="link link-primary font-semibold">i.c.Stars</a>.
        </p>
        <p className="mb-4">
          Explore the full curriculum:{' '}
          <a href="https://github.com/JValentineC/DevLog" target="_blank" rel="noopener noreferrer" className="link link-primary font-semibold">github.com/JValentineC/DevLog</a>
        </p>
        <p className="font-semibold">Let&apos;s build the habit of shipping — together. 🚀</p>
      </section>
    </div>
  )
}

export default AboutSection
