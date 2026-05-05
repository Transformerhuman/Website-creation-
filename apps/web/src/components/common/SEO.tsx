import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
  title?: string;
  description?: string;
  lang?: 'en' | 'ne';
}

const SEO: React.FC<Props> = ({ title, description, lang = 'en' }) => {
  const defaultTitle = lang === 'en' ? 'Agropulse Nepal - Modern Agriculture' : 'एग्रोपल्स नेपाल - आधुनिक कृषि';
  const defaultDesc = lang === 'en' ? 'Connecting farmers to markets and experts.' : 'किसानहरूलाई बजार र विशेषज्ञहरूसँग जोड्दै।';

  return (
    <Helmet>
      <title>{title ? `${title} | Agropulse` : defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <html lang={lang} />
    </Helmet>
  );
};

export default SEO;
