import './styles.css';

const App = () => {
  return (
    <>
      <header className="min-h-20 flex align-center justify-between px-[5vw]">
      <a href="/" className="brand" aria-label="Still home">
        <span className="brand-icon" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Still</span>
      </a>
      <input
        type="checkbox"
        id="menu-toggle"
        className="menu-toggle"
        aria-label="Toggle menu"
      />
      <label for="menu-toggle" className="menu" aria-label="Toggle menu"
        ><i></i><i></i
      ></label>
      <nav className="nav" aria-label="Primary navigation">
        <a href="#gallery">Memories</a>
        <a href="#how-it-works">How it works</a>
        <a href="#family">For families</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="header-actions">
        <a href="#" className="sign-in">Sign in</a>
        <a href="#gallery" className="custom-button custom-button-primary">
          Start your archive
        </a>
      </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">For all the days worth remembering</span>
            <h1 id="hero-title">Hold on to<br/><em>the little things.</em></h1>
            <p>A beautiful, living archive for the stories your family is still writing. Turn everyday photos into memories that grow more meaningful with time.</p>
            <div className="hero-actions">
              <button className="custom-button custom-button-primary" aria-label="Add your first memory">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 4v12M4 10h12"></path>
                </svg>
                Add your first memory
              </button>
              <a className="btn-underlined">
                Explore the archive 
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M11 6l4 4-4 4"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="collage" aria-label="A collection of family memories">
            <figure className="main-photo">
              <img
                src="public/images/collage-big-photo.avif"
                alt="Family spending time together outdoors"
              />
              <figcaption>
                <span>Lake District</span><span>Summer ’24</span>
              </figcaption>
            </figure>

            <figure className="small-photo">
              <img
                src="public/images/collage-small-photo.avif"
                alt="Child smiling during a family moment"
              />
            </figure>
            <div className="memory-note">
              <small>JUNE 18, 2024</small><strong>A very good day</strong>
              <p>We forgot the picnic blanket. Nobody minded.</p>
            </div>

            <div className="caption-chip">
              <b>M</b
              ><span
                ><small>Added by Mara</small>“The one with the
                strawberries.”</span
              >
            </div>
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-heading">
            <div>
              <span>THE FAMILY ARCHIVE</span>
              <h2>A life, gathered together.</h2>
            </div>
            <p>
              Not a camera roll. A considered collection of the people, places,
              and tiny details that make a family yours.
            </p>
          </div>
          <div className="filter-line">
            <button className="active">All memories</button><button>Family</button
            ><button>Mara</button><button>Leo</button><button>Nana</button
            ><span>128 memories</span>
          </div>
          <div className="gallery-grid">
            <article className="gallery-card tall">
              <img
                alt="Two sisters sitting in a field"
                src="https://images.unsplash.com/photo-1611890279484-2f70df6730fe?auto=format&amp;fit=crop&amp;w=1000&amp;q=86"
              />
              <div>
                <small>July 2023</small>
                <h3>The summer we stayed out late</h3>
                <button aria-label="Open The summer we stayed out late">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <article className="gallery-card wide">
              <img
                alt="Mother and child sharing a quiet moment"
                src="https://images.unsplash.com/photo-1784013225972-34a4e810e825?auto=format&amp;fit=crop&amp;w=1200&amp;q=86"
              />
              <div>
                <small>April 2024</small>
                <h3>Sunday at Nana’s</h3>
                <button aria-label="Open Sunday at Nana’s">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <article className="gallery-card">
              <img
                alt="Grandmother with her granddaughter"
                src="https://images.unsplash.com/photo-1505075288090-14733a88df88?auto=format&amp;fit=crop&amp;w=900&amp;q=86"
              />
              <div>
                <small>October 2021</small>
                <h3>Her favorite stories</h3>
                <button aria-label="Open Her favorite stories">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <article className="gallery-card">
              <img
                alt="Parent carrying a child outdoors"
                src="https://images.unsplash.com/photo-1628676306092-1238ef1dc851?auto=format&amp;fit=crop&amp;w=900&amp;q=86"
              />
              <div>
                <small>June 2022</small>
                <h3>Tiny explorer</h3>
                <button aria-label="Open Tiny explorer">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <article className="gallery-card wide">
              <img
                alt="Family enjoying a picnic"
                src="https://images.unsplash.com/photo-1681311311317-a0561a8eef74?auto=format&amp;fit=crop&amp;w=1200&amp;q=86"
              />
              <div>
                <small>May 2024</small>
                <h3>Picnic weather</h3>
                <button aria-label="Open Picnic weather">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <article className="gallery-card tall">
              <img
                alt="Father holding his daughter"
                src="https://images.unsplash.com/photo-1717883300138-f1fadd7d04cc?auto=format&amp;fit=crop&amp;w=900&amp;q=86"
              />
              <div>
                <small>August 2023</small>
                <h3>Always up here</h3>
                <button aria-label="Open Always up here">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </article>
            <button className="add-card">
              <b
                ><svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 4v12M4 10h12"></path></svg></b
              ><strong>Add a moment</strong
              ><small>Photo, story, voice, or video</small>
            </button>
          </div>
        </section>
        <section
          id="how-it-works"
          className="story-section"
          aria-labelledby="story-title"
        >
          <div className="story-copy">
            <span className="kicker">MORE THAN A PHOTO</span>
            <h2>Every picture has a story. <em>Help it remember.</em></h2>
            <p>
              Add the things a photograph can’t hold: the way she laughed, what he
              always said, the song playing in the kitchen.
            </p>
            <ol>
              <li>
                <b>01</b
                ><span
                  ><strong>Capture</strong
                  ><small>Bring in a photo or everyday moment.</small></span
                >
              </li>
              <li>
                <b>02</b
                ><span
                  ><strong>Tell</strong
                  ><small>Add voices, notes, places, and people.</small></span
                >
              </li>
              <li>
                <b>03</b
                ><span
                  ><strong>Preserve</strong
                  ><small>Keep it safe for every chapter ahead.</small></span
                >
              </li>
            </ol>
          </div>
          <div className="story-preview">
            <article>
              <img
                alt="Grandmother sharing a moment with her granddaughter"
                src="https://images.unsplash.com/photo-1505075288090-14733a88df88?auto=format&amp;fit=crop&amp;w=1200&amp;q=90"
              />
              <div>
                <small>OCTOBER 12, 2021 · AT NANA’S HOUSE</small>
                <h3>The stories she told us</h3>
                <p>
                  “Every Sunday, she’d pull the blue chair closer to the window.
                  This was the afternoon she told Mara about the dance hall...”
                </p>
                <span className="remembered"
                  ><b>N</b><b>M</b>
                  <small>Remembered by Nana &amp; Mara</small>
                </span>
              </div>
            </article>
            <div className="voice">
              <button aria-label="Play voice memory">▶</button
              ><span>||||||||||||||||</span><small>0:42 · Nana’s voice</small>
            </div>
          </div>
        </section>

        <section className="future" aria-labelledby="future-title">
          <div className="future-image">
            <img
              alt="A father holding his young daughter"
              src="https://images.unsplash.com/photo-1717883300138-f1fadd7d04cc?auto=format&amp;fit=crop&amp;w=1200&amp;q=90"
            /><span>FOR HER · 2040</span>
          </div>
          <div className="future-copy">
            <span className="kicker">A GIFT FOR LATER</span>
            <h2>Keep memories for who they’re becoming.</h2>
            <p>
              Create a private collection for someone too young to remember today.
              On the date you choose, they’ll receive a world of stories made just
              for them.
            </p>
            <blockquote>
              “For when you wonder how deeply you were loved from the very
              beginning.”<small>— Dad, on your fourth birthday</small>
            </blockquote>
            <button className="btn-underlined light">
              Create a time capsule
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h11M11 6l4 4-4 4"></path>
              </svg>
            </button>
          </div>
        </section>

        <section className="family" id="family" aria-labelledby="roles-title">
          <div className="center-heading">
            <span className="kicker">YOUR PEOPLE, YOUR WAY</span>
            <h2>It takes a family to tell a life.</h2>
            <p>
              Invite the people who hold a piece of the story. Everyone has a
              place, and you’re always in control.
            </p>
          </div>
          <div className="roles">
            <article>
              <b className="role role-0">O</b><small>01</small>
              <h3>Owner</h3>
              <p>Keeps the archive and decides who’s invited.</p>
            </article>
            <article>
              <b className="role role-1">F</b><small>02</small>
              <h3>Family member</h3>
              <p>Adds memories, stories, and shared chapters.</p>
            </article>
            <article>
              <b className="role role-2">C</b><small>03</small>
              <h3>Contributor</h3>
              <p>Helps fill in the moments they remember.</p>
            </article>
            <article>
              <b className="role role-3">V</b><small>04</small>
              <h3>Viewer</h3>
              <p>Enjoys the archive, without changing a thing.</p>
            </article>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-intro">
            <span className="kicker">WE’RE HERE TO HELP</span>
            <h2>Have a question?<br /><em>Let’s talk.</em></h2>
            <p>
              Whether you’re thinking about starting an archive, bringing your
              family in, or preserving something especially meaningful, we’d love
              to hear from you.
            </p>
            <div className="contact-details">
              <span>
                <small>EMAIL US</small>
                <strong>hello@stillarchive.com</strong>
              </span>
              <span>
                <small>RESPONSE TIME</small>
                <strong>Usually within two working days</strong>
              </span>
            </div>
            <div className="privacy-note">
              <span className="brand-icon" aria-hidden="true">
                <i></i><i></i><i></i>
              </span>
              <p>
                Your stories stay yours. We’ll only use your details to reply to
                this message.
              </p>
            </div>
          </div>
          <div className="form-wrap">
            <form>
              <div className="form-row">
                <label>
                  <span>Your name</span>
                  <input
                    placeholder="Anna Miller"
                    required=""
                    type="text"
                    name="name"
                  />
                </label>
                <label>
                  <span>Email address</span>
                  <input
                    placeholder="anna@example.com"
                    required=""
                    type="email"
                    name="email"
                /></label>
              </div>
              <label
                ><span>What can we help with?</span
                ><select name="topic" required="">
                  <option value="" disabled="" selected="">Choose a topic</option>
                  <option>Starting an archive</option>
                  <option>Inviting my family</option>
                  <option>Privacy and preservation</option>
                  <option>Something else</option>
                </select></label
              ><label
                ><span>Your message</span
                ><textarea
                  name="message"
                  rows="6"
                  placeholder="Tell us what’s on your mind..."
                  required=""
                ></textarea>
              </label>
              <div className="form-submit">
                <small
                  >By sending this form, you agree to our privacy policy.</small
                ><button className="custom-button custom-button-primary" type="submit">
                  Send message
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>
        <section className="closing" aria-labelledby="closing-title">
          <span className="brand-icon" aria-hidden="true"><i></i><i></i><i></i></span
          ><span className="kicker">YOUR STORY STARTS HERE</span>
          <h2>Some day, these will be<br /><em>the good old days.</em></h2>
          <p>Start with one photo. Add the story only you can tell.</p>
          <button className="custom-button">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 4v12M4 10h12"></path>
            </svg>
            Add your first memory</button
          ><small>Private by default · Invite family when you’re ready</small>
        </section>
      </main>
      <footer class="footer" aria-labelledby="footer-title">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true"><i></i><i></i><i></i></span
          ><span>still</span>
        </div>
        <p>For the stories that make us who we are.</p>
        <nav>
          <button>Privacy</button><button>Terms</button><button>Contact</button>
        </nav>
        <span>© 2026 Still Archive</span>
      </footer>
    </>
  );
};

export default App;