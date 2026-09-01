import PortfolioExperience from '@/components/PortfolioExperience';
import { projects } from '@/data/projects';

export default function Home() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'Person', name: 'Ammar Bin Yasir',
    jobTitle: 'AI Automation Engineer', url: 'https://ammar-bin-yasir.vercel.app',
    email: 'mailto:ammarbinyasir4899@gmail.com', telephone: '+92 340 4844291',
    sameAs: ['https://github.com/AmmarBinYasir489'], address: { '@type': 'PostalAddress', addressCountry: 'PK' }
  };
  return <><PortfolioExperience projects={projects} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></>;
}
