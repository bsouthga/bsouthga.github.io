import ReactMarkdown from "react-markdown";
import { PostMetadata } from "lib/posts";
import Katex from "components/Katex";
import math from "remark-math";
import ImageWrapper from "components/ImageWrapper";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import footnotes from "remark-footnotes";
import { useEffect, useMemo, useRef } from "react";
import codeStyle from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";
import style9 from "style9";

const styles = style9.create({
  paragraph: {
    marginBottom: "1em",
  },
  code: {
    borderColor: "currentColor",
    borderWidth: 1,
    borderStyle: "solid",
  },
  footnote: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
});

const SYNTAX_CUSTOM_STYLE = {
  lineHeight: "1",
  fontSize: "1.2em",
};

const SYNTAX_CODE_TAG_PROPS = {
  style: {
    lineHeight: "inherit",
    fontSize: "inherit",
  },
};

const PLUGINS = [math, footnotes];

type PostProps = {
  post: PostMetadata;
};

function Markdown(props: { content: string }): JSX.Element {
  const { content } = props;
  const footnoteRef = useRef<string[]>([]);

  useEffect(() => {
    footnoteRef.current = [];
  }, [content]);

  const renderers = useMemo(
    () => ({
      inlineMath: ({ value }: { value: string }) => <Katex code={value} />,
      math: ({ value }: { value: string }) => (
        <Katex code={value} displayMode />
      ),
      image: ({ alt = "", src }: { alt?: string; src: string }) => (
        <ImageWrapper caption={<Markdown content={alt} />}>
          <img alt={alt} width="100%" height="auto" src={src} />
        </ImageWrapper>
      ),
      // override paragraphs to allow div nesting
      paragraph: ({ children }: { children: JSX.Element }) => (
        <div className={styles("paragraph")}>{children}</div>
      ),
      code: ({ language, value }: { language: string; value: string }) => (
        <SyntaxHighlighter
          style={codeStyle}
          className={styles("code")}
          customStyle={SYNTAX_CUSTOM_STYLE}
          codeTagProps={SYNTAX_CODE_TAG_PROPS}
          language={language}
          children={value}
        />
      ),
      footnoteDefinition: ({
        children,
        identifier,
      }: {
        children: JSX.Element;
        identifier: string;
      }) => {
        const footnotes = footnoteRef.current;
        const index = footnotes.indexOf(identifier) + 1;

        return (
          <div id={identifier} className={styles("footnote")}>
            <a href={`#${identifier}`}>[{index}]</a>
            :&nbsp;
            {children}
          </div>
        );
      },
      footnoteReference: ({
        label,
        identifier,
      }: {
        label: string;
        identifier: string;
      }) => {
        const footnotes = footnoteRef.current;
        const index = footnotes.indexOf(identifier);

        let footnoteNumber: number;
        if (index === -1) {
          footnotes.push(identifier);
          footnoteNumber = footnotes.length;
        } else {
          footnoteNumber = index + 1;
        }

        return (
          <sup>
            <a href={`#${identifier}`}>[{footnoteNumber}]</a>
          </sup>
        );
      },
    }),
    []
  );

  return (
    <ReactMarkdown plugins={PLUGINS} renderers={renderers}>
      {content}
    </ReactMarkdown>
  );
}

export default function Post(props: PostProps): JSX.Element {
  const { post } = props;
  const { content } = post;
  return <Markdown content={content} />;
}
