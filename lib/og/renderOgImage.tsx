import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site";
import {
  OG_IMAGE_SIZE,
  type OgSection,
} from "@/lib/og/sections";
import { truncateText, wrapDescription } from "@/lib/og/text";

const TITLE_MAX_CHARS = 28;
const DESCRIPTION_MAX_LINES = 2;
const DESCRIPTION_CHARS_PER_LINE = 42;

async function getLogoSrc() {
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function renderOgImage(section: OgSection) {
  const logoSrc = await getLogoSrc();
  const title = truncateText(section.title, TITLE_MAX_CHARS);
  const descriptionLines = wrapDescription(
    section.description,
    DESCRIPTION_MAX_LINES,
    DESCRIPTION_CHARS_PER_LINE,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #fafafa 0%, #eef6ff 50%, #ecfdf5 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: 190,
            background: "#38bdf8",
            opacity: 0.12,
            top: -100,
            right: -80,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 210,
            background: "#10b981",
            opacity: 0.14,
            bottom: -140,
            left: -80,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 1024,
            height: 466,
            margin: "82px 88px",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 44,
            padding: "48px 52px",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse/Satori does not support next/image */}
          <img
            src={logoSrc}
            width={280}
            height={280}
            alt=""
            style={{
              width: 280,
              height: 280,
              borderRadius: 64,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 48,
              width: 592,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                color: "#52525b",
                letterSpacing: 0.4,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 800,
                color: "#18181b",
                letterSpacing: -1.5,
                lineHeight: 1.1,
                marginTop: 12,
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 18,
                overflow: "hidden",
              }}
            >
              {descriptionLines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    fontSize: 26,
                    fontWeight: 400,
                    color: "#52525b",
                    lineHeight: 1.35,
                    overflow: "hidden",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                background: section.badgeBackground,
                borderRadius: 21,
                padding: "8px 18px",
                alignSelf: "flex-start",
                fontSize: 22,
                fontWeight: 700,
                color: section.badgeColor,
              }}
            >
              {truncateText(section.badge, 18)}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
    },
  );
}
