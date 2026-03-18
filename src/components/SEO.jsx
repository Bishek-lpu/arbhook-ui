import { useEffect } from 'react';

export default function SEO({ title, description, keywords }) {
    useEffect(() => {
        // Update Title
        document.title = title ? `${title} | Arbhook` : 'Arbhook';

        // Helper to set meta tags
        const setMetaTag = (name, content, attribute = 'name') => {
            if (!content) return;
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const defaultDesc = 'Arbhook seamlessly hooks ARB coins for you. Make ARB wallet easy, buy ARB coins hassle-free.';
        const defaultKeywords = 'ARB, arbitrum, crypto wallet, buy ARB, crypto exchange, safe crypto, arbhook, arbhook.com, arb wallet, arb hook, arb hook.com, arb hook.com, arwallet, arbhook wallet, arbhook hook, arbhook hook.com, arbhook hook.com arbhook wallet arbhook hook arbhook hook.com arbhook hook.com arbhook wallet arbhook hook arbhook hook.com arbhook hook.com ';

        // Update Meta Tags
        setMetaTag('description', description || defaultDesc);
        setMetaTag('keywords', keywords || defaultKeywords);

        // Update Open Graph (Social Media) Tags
        setMetaTag('og:title', document.title, 'property');
        setMetaTag('og:description', description || defaultDesc, 'property');
        setMetaTag('og:type', 'website', 'property');
        setMetaTag('og:site_name', 'Arbhook', 'property');

        // Note: In a real production app you would also want og:image and twitter:card
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', document.title);
        setMetaTag('twitter:description', description || defaultDesc);

    }, [title, description, keywords]);

    return null;
}
