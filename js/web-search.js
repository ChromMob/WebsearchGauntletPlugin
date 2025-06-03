import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Inline, ActionPanel, Action, Content } from '@project-gauntlet/api/components';
import { useNavigation } from '@project-gauntlet/api/hooks';
import { useState, useEffect } from 'react';

var SearchEngine;
(function (SearchEngine) {
    SearchEngine["Google"] = "google";
    SearchEngine["Bing"] = "bing";
    SearchEngine["DuckDuckGo"] = "duckduckgo";
    SearchEngine["StartPage"] = "startpage";
})(SearchEngine || (SearchEngine = {}));
const SEARCH_ENGINE_PREFIXES = {
    "g!": SearchEngine.Google,
    "b!": SearchEngine.Bing,
    "d!": SearchEngine.DuckDuckGo,
    "s!": SearchEngine.StartPage,
};
// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const isUrl = (text) => {
    return URL_REGEX.test(text);
};
const getWebsiteFromQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    // Common website mappings
    const websiteMap = {
        'twitch': 'twitch.tv',
        'youtube': 'youtube.com',
        'yt': 'youtube.com',
        'github': 'github.com',
        'gh': 'github.com',
        'twitter': 'twitter.com',
        'tweet': 'twitter.com',
        'reddit': 'reddit.com',
        'r/': 'reddit.com',
        'facebook': 'facebook.com',
        'fb': 'facebook.com',
        'instagram': 'instagram.com',
        'ig': 'instagram.com',
        'linkedin': 'linkedin.com',
        'medium': 'medium.com',
        'stackoverflow': 'stackoverflow.com',
        'so': 'stackoverflow.com',
        'wikipedia': 'wikipedia.org',
        'wiki': 'wikipedia.org',
        'amazon': 'amazon.com',
        'netflix': 'netflix.com',
        'spotify': 'spotify.com',
        'discord': 'discord.com',
        'dc': 'discord.com',
        'gmail': 'gmail.com',
        'google': 'google.com',
        'maps': 'google.com/maps',
        'drive': 'drive.google.com',
        'docs': 'docs.google.com',
        'calendar': 'calendar.google.com',
        'meet': 'meet.google.com',
        'outlook': 'outlook.com',
        'hotmail': 'outlook.com',
        'yahoo': 'yahoo.com',
        'bing': 'bing.com',
        'duckduckgo': 'duckduckgo.com',
        'ddg': 'duckduckgo.com',
        'startpage': 'startpage.com',
        'brave': 'brave.com',
        'firefox': 'mozilla.org',
        'chrome': 'google.com/chrome',
        'edge': 'microsoft.com/edge',
        'safari': 'apple.com/safari',
        'opera': 'opera.com',
        'vivaldi': 'vivaldi.com',
        'tor': 'torproject.org',
        'protonmail': 'protonmail.com',
        'tutanota': 'tutanota.com',
        'signal': 'signal.org',
        'telegram': 'telegram.org',
        'whatsapp': 'whatsapp.com',
        'slack': 'slack.com',
        'teams': 'teams.microsoft.com',
        'zoom': 'zoom.us',
        'jitsi': 'meet.jit.si',
        'notion': 'notion.so',
        'evernote': 'evernote.com',
        'onenote': 'onenote.com',
        'dropbox': 'dropbox.com',
        'mega': 'mega.nz',
        'icloud': 'icloud.com',
        'onedrive': 'onedrive.live.com',
        'box': 'box.com',
        'pinterest': 'pinterest.com',
        'tiktok': 'tiktok.com',
        'tumblr': 'tumblr.com',
        'flickr': 'flickr.com',
        'imgur': 'imgur.com',
        'deviantart': 'deviantart.com',
        'behance': 'behance.net',
        'dribbble': 'dribbble.com',
        'figma': 'figma.com',
        'canva': 'canva.com',
        'wordpress': 'wordpress.com',
        'substack': 'substack.com',
        'patreon': 'patreon.com',
        'ko-fi': 'ko-fi.com',
        'paypal': 'paypal.com',
        'stripe': 'stripe.com',
        'shopify': 'shopify.com',
        'etsy': 'etsy.com',
        'ebay': 'ebay.com',
        'aliexpress': 'aliexpress.com',
        'wish': 'wish.com',
        'walmart': 'walmart.com',
        'target': 'target.com',
        'bestbuy': 'bestbuy.com',
        'newegg': 'newegg.com',
        'steam': 'store.steampowered.com',
        'epic': 'epicgames.com',
        'gog': 'gog.com',
        'itch': 'itch.io',
        'humble': 'humblebundle.com',
        'g2a': 'g2a.com',
        'kinguin': 'kinguin.net',
        'cdkeys': 'cdkeys.com',
        'greenmangaming': 'greenmangaming.com',
        'fanatical': 'fanatical.com',
        'indiegala': 'indiegala.com',
        'bundle': 'humblebundle.com',
        'game': 'store.steampowered.com',
        'games': 'store.steampowered.com'
    };
    // Check for exact matches first
    if (websiteMap[lowerQuery]) {
        return websiteMap[lowerQuery];
    }
    // Check for partial matches
    for (const [key, domain] of Object.entries(websiteMap)) {
        if (lowerQuery.includes(key)) {
            return domain;
        }
    }
    return null;
};
const ensureUrl = (text) => {
    if (text.startsWith('http://') || text.startsWith('https://')) {
        return text;
    }
    return `https://${text}`;
};
const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = 'websearch_url_history';
// Function to calculate string similarity (0 to 1)
const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    // If one string contains the other, return high similarity
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.9;
    }
    // Simple character matching similarity
    const set1 = new Set(s1);
    const set2 = new Set(s2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
};
const getUrlHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    }
    catch (e) {
        console.error('Error reading URL history:', e);
        return [];
    }
};
const saveUrlToHistory = (url) => {
    try {
        const history = getUrlHistory();
        // Remove if already exists
        const filteredHistory = history.filter(item => item !== url);
        // Add to beginning
        filteredHistory.unshift(url);
        // Keep only last MAX_HISTORY_ITEMS
        const trimmedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
    }
    catch (e) {
        console.error('Error saving URL to history:', e);
    }
};
const openSearch = async (url) => {
    try {
        const command = new Deno.Command("xdg-open", {
            args: [url],
        });
        const child = await command.spawn();
        // Save to history if it's a URL
        if (isUrl(url)) {
            saveUrlToHistory(url);
        }
    }
    catch (e) {
        console.error("Error opening web search:", e);
    }
};
function webSearch(props) {
    useNavigation();
    const text = props.text;
    const [suggestions, setSuggestions] = useState([]);
    const [urlHistory, setUrlHistory] = useState([]);
    const [ddgResults, setDdgResults] = useState([]);
    useEffect(() => {
        setUrlHistory(getUrlHistory());
    }, []);
    if (text.length === 0) {
        return undefined;
    }
    // Check if input is a URL
    if (isUrl(text)) {
        const url = ensureUrl(text);
        return (jsx(Inline, { actions: jsx(ActionPanel, { children: jsx(Action, { label: "Open URL", onAction: () => openSearch(url) }) }), children: jsx(Inline.Center, { children: jsxs(Content.H3, { children: ["Open URL: ", url] }) }) }));
    }
    // Check for search engine prefix
    const prefix = Object.keys(SEARCH_ENGINE_PREFIXES).find(p => text.startsWith(p));
    const searchEngine = prefix ? SEARCH_ENGINE_PREFIXES[prefix] : SearchEngine.Google;
    const searchQuery = prefix ? text.slice(prefix.length).trim() : text;
    if (searchQuery.length === 0) {
        return undefined;
    }
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Fetch Google suggestions
                const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data[1] || []);
                }
                // Fetch DuckDuckGo results
                const ddgResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`);
                if (ddgResponse.ok) {
                    const ddgData = await ddgResponse.json();
                    const results = [];
                    // Add AbstractURL if it exists and is not Wikipedia or DuckDuckGo search
                    if (ddgData.AbstractURL &&
                        !ddgData.AbstractURL.includes('wikipedia.org') &&
                        !ddgData.AbstractURL.includes('duckduckgo.com')) {
                        results.push({
                            url: ddgData.AbstractURL,
                            title: ddgData.Heading || ddgData.AbstractURL,
                            isDirect: true
                        });
                    }
                    // Add RelatedTopics, prioritizing non-Wikipedia and non-DuckDuckGo URLs
                    if (ddgData.RelatedTopics) {
                        const nonWikiTopics = ddgData.RelatedTopics.filter((topic) => topic.FirstURL &&
                            !topic.FirstURL.includes('wikipedia.org') &&
                            !topic.FirstURL.includes('duckduckgo.com'));
                        const wikiTopics = ddgData.RelatedTopics.filter((topic) => topic.FirstURL &&
                            topic.FirstURL.includes('wikipedia.org') &&
                            !topic.FirstURL.includes('duckduckgo.com'));
                        // Add non-Wikipedia topics first
                        nonWikiTopics.forEach((topic) => {
                            if (topic.FirstURL) {
                                results.push({
                                    url: topic.FirstURL,
                                    title: topic.Text || topic.FirstURL,
                                    isDirect: true
                                });
                            }
                        });
                        // Add Wikipedia topics last
                        wikiTopics.forEach((topic) => {
                            if (topic.FirstURL) {
                                results.push({
                                    url: topic.FirstURL,
                                    title: topic.Text || topic.FirstURL,
                                    isDirect: false
                                });
                            }
                        });
                    }
                    setDdgResults(results);
                }
            }
            catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };
        if (searchQuery.length > 2) {
            fetchSuggestions();
        }
        else {
            setSuggestions([]);
            setDdgResults([]);
        }
    }, [searchQuery]);
    const getSearchUrl = (query, engine) => {
        const encodedQuery = encodeURIComponent(query);
        switch (engine) {
            case SearchEngine.Google:
                return `https://www.google.com/search?q=${encodedQuery}`;
            case SearchEngine.Bing:
                return `https://www.bing.com/search?q=${encodedQuery}`;
            case SearchEngine.DuckDuckGo:
                return `https://duckduckgo.com/?q=${encodedQuery}`;
            case SearchEngine.StartPage:
                return `https://www.startpage.com/do/search?q=${encodedQuery}`;
        }
    };
    const searchUrl = getSearchUrl(searchQuery, searchEngine);
    // Filter URL history based on search query and find most similar URL
    const matchingHistory = urlHistory.filter(url => url.toLowerCase().includes(searchQuery.toLowerCase()) && !url.includes('wikipedia.org'));
    // Find the most similar URL from history
    const mostSimilarUrl = matchingHistory.length > 0
        ? matchingHistory.reduce((best, current) => {
            const currentSimilarity = calculateSimilarity(current, searchQuery);
            const bestSimilarity = calculateSimilarity(best, searchQuery);
            return currentSimilarity > bestSimilarity ? current : best;
        })
        : null;
    // Find the most similar suggestion
    const mostSimilarSuggestion = suggestions.length > 0
        ? suggestions.reduce((best, current) => {
            const currentSimilarity = calculateSimilarity(current, searchQuery);
            const bestSimilarity = calculateSimilarity(best, searchQuery);
            return currentSimilarity > bestSimilarity ? current : best;
        })
        : null;
    // Find the most similar URL from DuckDuckGo results
    const mostSimilarDdgUrl = ddgResults.length > 0
        ? ddgResults.reduce((best, current) => {
            const currentSimilarity = calculateSimilarity(current.title, searchQuery);
            const bestSimilarity = calculateSimilarity(best.title, searchQuery);
            // Check if query matches a known website
            const targetWebsite = getWebsiteFromQuery(searchQuery);
            if (targetWebsite) {
                // If current URL matches the target website, prefer it
                if (current.url.includes(targetWebsite) && !best.url.includes(targetWebsite)) {
                    return current;
                }
                // If best URL matches the target website, keep it
                if (best.url.includes(targetWebsite) && !current.url.includes(targetWebsite)) {
                    return best;
                }
            }
            // If current is Wikipedia and best is not, prefer best
            if (current.url.includes('wikipedia.org') && !best.url.includes('wikipedia.org')) {
                return best;
            }
            // If best is Wikipedia and current is not, prefer current
            if (best.url.includes('wikipedia.org') && !current.url.includes('wikipedia.org')) {
                return current;
            }
            // If either is a DuckDuckGo search URL, prefer the other
            if (current.url.includes('duckduckgo.com') && !best.url.includes('duckduckgo.com')) {
                return best;
            }
            if (best.url.includes('duckduckgo.com') && !current.url.includes('duckduckgo.com')) {
                return current;
            }
            // If both are Wikipedia or both are not, use similarity
            return currentSimilarity > bestSimilarity ? current : best;
        })
        : null;
    const similarityThreshold = 0.7; // Adjust this threshold as needed
    const historySimilarity = mostSimilarUrl ? calculateSimilarity(mostSimilarUrl, searchQuery) : 0;
    const suggestionSimilarity = mostSimilarSuggestion ? calculateSimilarity(mostSimilarSuggestion, searchQuery) : 0;
    const ddgUrlSimilarity = mostSimilarDdgUrl ? calculateSimilarity(mostSimilarDdgUrl.title, searchQuery) : 0;
    // Determine the best action based on similarity scores
    const targetWebsite = getWebsiteFromQuery(searchQuery);
    const shouldUseHistory = historySimilarity > similarityThreshold;
    const shouldUseDdgUrl = !shouldUseHistory &&
        mostSimilarDdgUrl &&
        (ddgUrlSimilarity > similarityThreshold ||
            (targetWebsite && mostSimilarDdgUrl.url.includes(targetWebsite))) &&
        !mostSimilarDdgUrl.url.includes('wikipedia.org') &&
        !mostSimilarDdgUrl.url.includes('duckduckgo.com');
    const shouldUseSuggestion = !shouldUseHistory && !shouldUseDdgUrl && suggestionSimilarity > similarityThreshold;
    // If we have a target website but no matching URL, create a direct URL
    const directWebsiteUrl = targetWebsite && !shouldUseHistory && !shouldUseDdgUrl
        ? `https://www.${targetWebsite}`
        : null;
    return (jsx(Inline, { actions: jsxs(ActionPanel, { children: [shouldUseHistory ? (jsx(Action, { label: `Open ${mostSimilarUrl}`, onAction: () => openSearch(mostSimilarUrl) })) : shouldUseDdgUrl ? (jsx(Action, { label: `Open ${mostSimilarDdgUrl.title}`, onAction: () => openSearch(mostSimilarDdgUrl.url) })) : directWebsiteUrl ? (jsx(Action, { label: `Open ${targetWebsite}`, onAction: () => openSearch(directWebsiteUrl) })) : shouldUseSuggestion ? (jsx(Action, { label: `Search "${mostSimilarSuggestion}"`, onAction: () => openSearch(getSearchUrl(mostSimilarSuggestion, searchEngine)) })) : (jsx(Action, { label: `Search on ${searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)}`, onAction: () => openSearch(searchUrl) })), jsxs(ActionPanel.Section, { title: "Search Engines", children: [jsx(ActionPanel.Action, { label: "Search on Google", onAction: () => openSearch(getSearchUrl(searchQuery, SearchEngine.Google)) }), jsx(ActionPanel.Action, { label: "Search on Bing", onAction: () => openSearch(getSearchUrl(searchQuery, SearchEngine.Bing)) }), jsx(ActionPanel.Action, { label: "Search on DuckDuckGo", onAction: () => openSearch(getSearchUrl(searchQuery, SearchEngine.DuckDuckGo)) }), jsx(ActionPanel.Action, { label: "Search on StartPage", onAction: () => openSearch(getSearchUrl(searchQuery, SearchEngine.StartPage)) })] }), matchingHistory.length > 0 && (jsx(ActionPanel.Section, { title: "Recent URLs", children: matchingHistory.map((url, index) => (jsx(ActionPanel.Action, { label: url, onAction: () => openSearch(url) }, `history-${index}`))) })), ddgResults.length > 0 && (jsx(ActionPanel.Section, { title: "Suggested URLs", children: ddgResults.map((result, index) => (jsx(ActionPanel.Action, { label: result.title, onAction: () => openSearch(result.url) }, `ddg-${index}`))) })), suggestions.length > 0 && (jsx(ActionPanel.Section, { title: "Google Suggestions", children: suggestions.map((suggestion, index) => (jsx(ActionPanel.Action, { label: suggestion, onAction: () => openSearch(getSearchUrl(suggestion, SearchEngine.Google)) }, `suggestion-${index}`))) }))] }), children: jsx(Inline.Center, { children: shouldUseHistory ? (jsxs(Fragment, { children: [jsx(Content.H3, { children: "Opening URL from history:" }), jsx(Content.H3, { children: mostSimilarUrl })] })) : shouldUseDdgUrl ? (jsxs(Fragment, { children: [jsx(Content.H3, { children: "Opening suggested URL:" }), jsx(Content.H3, { children: mostSimilarDdgUrl.title }), jsx(Content.H4, { children: mostSimilarDdgUrl.url })] })) : directWebsiteUrl ? (jsxs(Fragment, { children: [jsx(Content.H3, { children: "Opening website:" }), jsx(Content.H3, { children: targetWebsite }), jsx(Content.H4, { children: directWebsiteUrl })] })) : shouldUseSuggestion ? (jsxs(Fragment, { children: [jsx(Content.H3, { children: "Using suggested search:" }), jsxs(Content.H3, { children: ["\"", mostSimilarSuggestion, "\""] })] })) : (jsxs(Fragment, { children: [jsxs(Content.H3, { children: ["Looking for \"", searchQuery, "\" on ", searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)] }), jsx(Content.H3, { children: searchUrl })] })) }) }));
}

export { webSearch as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNlYXJjaC5qcyIsInNvdXJjZXMiOltdLCJzb3VyY2VzQ29udGVudCI6W10sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
