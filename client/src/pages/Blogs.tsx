import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BLOGS = [
  {
    id: 1,
    title: 'The Art of Silk Ribbon Wrapping',
    summary: 'Discover how hand-tied double-satin ribbons and custom gold wax stamps elevate a simple hamper into a luxury experience.',
    content: 'Luxury is in the details. At Gajanana, we believe that wrapping is an art form. When you send a gift box wrapped in silk mesh or rich velvet, the opening experience is just as memorable as the contents itself...',
    author: 'Elena Rostova',
    date: 'June 20, 2026',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'
  },
  {
    id: 2,
    title: '5 Hampers that Guarantee Smiles on Birthdays',
    summary: 'A curated list of combinations containing white teddy bears, rich dark chocolates, and freshly plucked orchids.',
    content: 'Stuck on birthday gift ideas? Flowers are temporary, and electronics are cold. A mixed basket representing warmth, indulgence, and affection is the ultimate choice. Our study shows that plush bunnies combined with dark chocolate truffles receive the highest ratings...',
    author: 'Kavitha Kumar',
    date: 'June 18, 2026',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500'
  },
  {
    id: 3,
    title: 'Decoding Chocolate Pairings for Anniversaries',
    summary: 'Learn how Belgian truffles match single-origin coffee beans and red roses for golden milestone celebrations.',
    content: 'Artisanal dark chocolate requires complex pairings. When matched with dry roasted almonds, fresh premium lilies, or luxury room sprays, it stimulates a sensory experience perfect for marking silver and golden jubilees...',
    author: 'Chef Ranveer',
    date: 'June 15, 2026',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'
  }
];

const Blogs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Gifting Journals</span>
        <h2 className="font-serif text-3xl font-bold text-luxury-black-dark dark:text-white">Our Gifting Blog</h2>
        <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BLOGS.map((blog) => (
          <div
            key={blog.id}
            className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 overflow-hidden shadow-md hover:shadow-gold-glow transition-all duration-300 flex flex-col justify-between"
          >
            {/* Banner image */}
            <div className="h-48 overflow-hidden bg-neutral-100">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-[10px] text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {blog.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {blog.author}
                  </span>
                </div>
                <h3 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white line-clamp-2 hover:text-luxury-red transition-colors">
                  {blog.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                  {blog.summary}
                </p>
              </div>

              <button
                onClick={() => alert(`Full Blog Article: "${blog.title}"\n\n${blog.content}`)}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-luxury-red hover:text-luxury-gold mt-6 tracking-wider w-fit"
              >
                <span>Read Story</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Blogs;
