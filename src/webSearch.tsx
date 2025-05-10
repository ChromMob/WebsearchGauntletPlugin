import {
  Action,
  ActionPanel,
  Content,
  Inline,
} from "@project-gauntlet/api/components";
import { ReactNode } from "react";
import * as deno_open from "@opensrc/deno-open";

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
              console.log("action");
              try {
                const command = new Deno.Command("xdg-open", {
                  args: [searchUrl],
                });
                const child = await command.spawn();
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
