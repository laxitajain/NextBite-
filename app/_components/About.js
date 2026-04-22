function About() {
  return (
    <div>
      <h1 className="text-5xl font-anton uppercase">About Us</h1>

      <p className="text-lg mt-2 font-semibold">
        Despite advances in technology and agriculture, hunger remains one of
        the most pressing global challenges, affecting over 800 million people
        worldwide. The United Nation&apos;s Sustainable Development Goal 2 (SDG
        2) aims to eradicate hunger and ensure food security by 2030,
        recognizing that access to nutritious food is a fundamental human right
        and a cornerstone of sustainable development.
      </p>
      <p className="text-lg mt-2 font-semibold">
        At
        <span className="font-bold"> Nextbite</span>, we believe that hunger and
        food wastage must not co-exist. Our community-driven platform connects
        food donors with individuals and organizations in need, helping to
        reduce food waste and fight hunger.
      </p>

      <h3 className="text-xl font-semibold text-primary mt-6 mb-3">
        How it works?
      </h3>
      <div className="grid md:grid-cols-3 font-semibold gap-6 text-left">
        <div className="bg-accent-mango p-5 rounded-xl hover:scale-105 duration-300 shadow-lg">
          <h4 className="font-bold text-secondary mb-2">1. Sign Up</h4>
          <p className="text-primary">
            Create a free account to join our community as a donor or receiver.
          </p>
        </div>
        <div className="bg-secondary p-5 rounded-xl hover:scale-105 duration-300 shadow-lg">
          <h4 className="font-bold text-primary mb-2">
            2. Share or Browse
          </h4>
          <p className="text-primary">
            Donors can list surplus meals with pickup instructions. Receivers
            can browse nearby available food using the map.
          </p>
        </div>
        <div className="bg-primary p-5 rounded-xl hover:scale-105 duration-300 shadow-lg">
          <h4 className="font-bold text-secondary mb-2">3. Connect & Collect</h4>
          <p className="text-accent-light">
            Coordinate pickup directly through the platform and mark meals as
            collected to track impact.
          </p>
        </div>
      </div>

      <p className="text-md font-semibold mt-6">
        ❤︎ Let&apos;s move towards building a more sustainable and compassionate
        world. Every meal saved is a life touched.
      </p>
    </div>
  );
}

export default About;
