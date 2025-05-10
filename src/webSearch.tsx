import {
  Action,
  ActionPanel,
  Content,
  Inline,
} from "@project-gauntlet/api/components";
import { ReactNode } from "react";

export default function webSearch(props: {
  text: string;
}): ReactNode | undefined {
  const text = props.text;
  console.log("render");

  if (!text.startsWith("web")) {
    return undefined;
  }

  const searchQuery = text.replace(/^web\s*/, "").trim();

  if (searchQuery.length === 0) {
    return undefined;
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    searchQuery
  )}`;

  return (
    <Inline
      actions={
        <ActionPanel>
          <Action
            label={"Web search"}
            onAction={async () => {
              try {
                console.log("open web search");

                const cmd = new Deno.Command("xdg-open", {
                  args: [searchUrl],
                  env: {
                    LD_LIBRARY_PATH: "",
                  },
                });

                console.log("cmd", await cmd.output());
                cmd.spawn();
              } catch (e) {
                console.error("Error opening web search:", e);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Inline.Center>
        <Content.H3>Looking for "{searchQuery}" on Google</Content.H3>
        <Content.H3>{searchUrl}</Content.H3>
      </Inline.Center>
    </Inline>
  );
}
