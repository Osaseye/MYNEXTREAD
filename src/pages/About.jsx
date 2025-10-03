import React from 'react';
import { 
  BookOpen, 
  Heart, 
  Target, 
  Zap, 
  Github, 
  Mail, 
  MessageCircle,
  User,
  GraduationCap,
  Code,
  Globe,
  Sparkles,
  Rocket
} from 'lucide-react';

const About = () => {
  const futureEnhancements = [
    {
      icon: Zap,
      title: 'AI-Powered Recommendations',
      description: 'Enhanced machine learning algorithms for more accurate personalized suggestions based on user behavior patterns.'
    },
    {
      icon: Globe,
      title: 'Social Features',
      description: 'User profiles, review system, and community-driven recommendations to connect anime and manga enthusiasts.'
    },
    {
      icon: Sparkles,
      title: 'Advanced Filtering',
      description: 'More sophisticated filtering options including mood-based recommendations, release year ranges, and studio preferences.'
    },
    {
      icon: Heart,
      title: 'Watchlist Integration',
      description: 'Direct integration with popular platforms like MyAnimeList, AniList profiles, and streaming service watchlists.'
    }
  ];

  return (
    <div className="min-h-screen bg-anime-dark">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-anime-dark via-anime-card to-anime-accent py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-3xl flex items-center justify-center mb-6 sm:mb-0 sm:mr-8 shadow-anime-glow-cyan">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-anime-dark" />
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-anime-text-primary">
              My<span className="text-anime-cyan">Next</span>Read
            </h1>
          </div>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-anime-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed">
            Your ultimate companion for discovering amazing anime, manga, and light novels without the overwhelming choice paralysis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What This App Is About */}
        <section className="mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-anime-text-primary text-center mb-12">
            What Is <span className="text-anime-cyan">MyNextRead</span>?
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-anime-card/50 backdrop-blur-sm border border-anime-hover rounded-3xl p-8 sm:p-12 shadow-anime-glow-cyan mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-anime-glow-cyan">
                <Target className="w-8 h-8 text-anime-dark" />
              </div>
              
              <div className="text-center space-y-6">
                <p className="text-lg sm:text-xl text-anime-text-secondary leading-relaxed">
                  MyNextRead solves the biggest problem facing anime, manga, and light novel enthusiasts today: 
                  <strong className="text-anime-cyan"> choice paralysis</strong>. With thousands of amazing titles available 
                  across multiple platforms, finding your next perfect watch or read has become overwhelming.
                </p>
                
                <p className="text-lg sm:text-xl text-anime-text-secondary leading-relaxed">
                  Instead of endless scrolling through lists, MyNextRead provides 
                  <strong className="text-anime-purple"> one carefully curated recommendation at a time</strong>, 
                  based on your preferences, saved library, and sophisticated filtering algorithms powered by the AniList database.
                </p>
                
                <p className="text-lg sm:text-xl text-anime-text-secondary leading-relaxed">
                  Whether you're looking for your next binge-worthy anime, an engaging manga series, 
                  or a captivating light novel, MyNextRead takes the guesswork out of discovery and gets you 
                  <strong className="text-anime-pink"> straight to the good stuff</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Future Enhancements */}
        <section className="mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-anime-text-primary text-center mb-12">
            Future <span className="text-anime-purple">Enhancements</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {futureEnhancements.map((enhancement, index) => {
              const Icon = enhancement.icon;
              return (
                <div key={index} className="bg-anime-card/50 backdrop-blur-sm border border-anime-hover rounded-2xl p-6 sm:p-8 hover:border-anime-cyan transition-all group">
                  <div className="w-14 h-14 bg-gradient-to-r from-anime-cyan to-anime-purple rounded-2xl flex items-center justify-center mb-6 shadow-anime-glow-cyan group-hover:shadow-anime-glow-purple transition-all">
                    <Icon className="w-7 h-7 text-anime-dark" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-anime-text-primary mb-4">{enhancement.title}</h3>
                  <p className="text-anime-text-secondary leading-relaxed">{enhancement.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Creator Section */}
        <section className="mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-anime-text-primary text-center mb-12">
            Meet The <span className="text-anime-pink">Creator</span>
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-anime-card/50 backdrop-blur-sm border border-anime-hover rounded-3xl p-8 sm:p-12 shadow-anime-glow-pink">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-anime-pink to-anime-cyan rounded-3xl flex items-center justify-center shadow-anime-glow-pink">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-anime-dark" />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-anime-text-primary mb-4">
                    Adebowale Oluwasegun
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <GraduationCap className="w-5 h-5 text-anime-cyan" />
                      <span className="text-anime-text-secondary">400L Software Engineering Student at Babcock University</span>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Code className="w-5 h-5 text-anime-purple" />
                      <span className="text-anime-text-secondary">Fullstack Developer</span>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Github className="w-5 h-5 text-anime-pink" />
                      <a 
                        href="https://github.com/osaseye" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-anime-cyan hover:text-anime-purple transition-colors"
                      >
                        @osaseye
                      </a>
                    </div>
                  </div>
                  
                  <p className="text-lg text-anime-text-secondary leading-relaxed">
                    Passionate about creating solutions that make life easier for fellow anime and manga enthusiasts. 
                    MyNextRead was born from my own frustration with choice paralysis when trying to find my next great watch or read.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-anime-text-primary text-center mb-12">
            Share Your <span className="text-anime-cyan">Feedback</span>
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-anime-card/50 backdrop-blur-sm border border-anime-hover rounded-3xl p-8 sm:p-12 shadow-anime-glow-purple">
              <div className="w-16 h-16 bg-gradient-to-r from-anime-purple to-anime-pink rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-anime-glow-purple">
                <MessageCircle className="w-8 h-8 text-anime-dark" />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-anime-text-primary mb-4">We'd Love to Hear From You!</h3>
                <p className="text-anime-text-secondary">
                  Your feedback helps make MyNextRead better for everyone. Share your thoughts, suggestions, or just say hello!
                </p>
              </div>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-anime-text-primary font-medium mb-2">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-anime-dark border border-anime-hover text-anime-text-primary placeholder-anime-text-secondary focus:ring-2 focus:ring-anime-cyan focus:border-anime-cyan outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-anime-text-primary font-medium mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-anime-dark border border-anime-hover text-anime-text-primary placeholder-anime-text-secondary focus:ring-2 focus:ring-anime-cyan focus:border-anime-cyan outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-anime-text-primary font-medium mb-2">Your Message</label>
                  <textarea
                    placeholder="Tell us what you think about MyNextRead, suggest new features, report bugs, or just say hello!"
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-anime-dark border border-anime-hover text-anime-text-primary placeholder-anime-text-secondary focus:ring-2 focus:ring-anime-cyan focus:border-anime-cyan outline-none resize-none transition-all"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-anime-cyan to-anime-purple text-anime-dark py-4 px-8 rounded-xl font-bold text-lg hover:shadow-anime-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Send Feedback
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-anime-hover bg-anime-card/30 rounded-2xl">
          <div className="flex items-center justify-center mb-6 flex-wrap gap-2">
            <Rocket className="w-6 h-6 text-anime-cyan" />
            <p className="text-anime-text-secondary text-lg">
              Built with <Heart className="w-4 h-4 text-anime-pink inline fill-current" /> for the anime, manga, and light novel community
            </p>
          </div>
          <p className="text-sm text-anime-text-secondary/70">
            © 2025 MyNextRead by Adebowale Oluwasegun. Powered by AniList API.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default About;