import NewsletterAction from '@/components/NewsletterAction';
export const metadata = { title: 'Confirm newsletter signup | Tryon History Museum', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function Page() { return <NewsletterAction action="confirm" />; }
