import { jsx, jsxs } from 'react/jsx-runtime';
import { Inline, ActionPanel, Action, Content } from '@project-gauntlet/api/components';

function webSearch(props) {
    const text = props.text;
    console.log("render");
    if (!text.startsWith("web")) {
        return undefined;
    }
    const searchQuery = text.replace(/^web\s*/, "").trim();
    if (searchQuery.length === 0) {
        return undefined;
    }
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    return (jsx(Inline, { actions: jsx(ActionPanel, { children: jsx(Action, { label: "Web search", onAction: async () => {
                    console.log("action");
                    try {
                        const command = new Deno.Command("xdg-open", {
                            args: [searchUrl],
                        });
                        const child = await command.spawn();
                    }
                    catch (e) {
                        console.error("Error opening web search:", e);
                    }
                } }) }), children: jsxs(Inline.Center, { children: [jsxs(Content.H3, { children: ["Looking for \"", searchQuery, "\" on Google"] }), jsx(Content.H3, { children: searchUrl })] }) }));
}

export { webSearch as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNlYXJjaC5qcyIsInNvdXJjZXMiOltdLCJzb3VyY2VzQ29udGVudCI6W10sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
