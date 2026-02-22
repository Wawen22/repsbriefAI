// src/components/email/WeeklyBriefEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components'
import * as React from 'react'
import { IdeaObject, NicheConfig } from '@/types/niche'

interface WeeklyBriefEmailProps {
  niche: NicheConfig
  ideas: IdeaObject[]
}

export const WeeklyBriefEmail = ({
  niche,
  ideas,
}: WeeklyBriefEmailProps) => (
  <Html>
    <Head />
    <Preview>🏋️ Your RepsBrief is ready — 20 ideas for this week</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* 1. Header */}
        <Section style={headerSection}>
          <Heading style={h1}>RepsBrief</Heading>
          <Text style={subtitle}>Your Weekly ${niche.label} Strategy</Text>
        </Section>

        <Hr style={hr} />

        {/* 2. Weekly Wins (Trends Summary) */}
        <Section style={section}>
          <Heading style={h2}>📈 Weekly Wins</Heading>
          <Text style={text}>
            We've analyzed the latest trends across Reddit, YouTube, and Google Trends for you. 
            The noise is gone. The signal is here.
          </Text>
        </Section>

        {/* 3. The 20 Reps (Ideas) */}
        <Section style={section}>
          <Heading style={h2}>💡 The 20 Reps</Heading>
          {ideas.map((idea, index) => (
            <div key={index} style={ideaCard}>
              <Text style={ideaTitle}>
                <strong>{index + 1}. {idea.title}</strong> [{idea.format}]
              </Text>
              <Text style={ideaHook}>🪝 {idea.hook}</Text>
              <Text style={ideaDesc}>{idea.description}</Text>
              <Text style={ideaWhy}>✨ Why it works: {idea.whyItWorks}</Text>
            </div>
          ))}
        </Section>

        {/* 4. Pro Tip */}
        <Section style={section}>
          <Heading style={h2}>🔥 Pro Tip</Heading>
          <Text style={text}>
            Focus on high-velocity hooks this week. Audiences are leaning towards 
            educational storytelling over pure aesthetics.
          </Text>
        </Section>

        {/* 5. Upgrade CTA */}
        <Section style={ctaSection}>
          <Heading style={h3}>Want more depth?</Heading>
          <Text style={text}>
            Pro users get access to the interactive dashboard, 3-month history, 
            and advanced format filters.
          </Text>
          <Link href="https://repsbrief.com/dashboard" style={button}>
            Access Dashboard
          </Link>
        </Section>

        <Hr style={hr} />

        {/* 6. Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © 2026 RepsBrief. All rights reserved. <br />
            You're receiving this because you subscribed to weekly briefs. <br />
            <Link href="https://repsbrief.com/api/unsubscribe" style={footerLink}>
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const headerSection = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#0f172a',
  color: '#ffffff',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const subtitle = {
  fontSize: '16px',
  margin: '8px 0 0',
}

const section = {
  padding: '0 32px 32px',
}

const h2 = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '32px',
  marginBottom: '16px',
}

const h3 = {
  fontSize: '20px',
  fontWeight: 'bold',
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4b5563',
}

const ideaCard = {
  padding: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  marginBottom: '16px',
}

const ideaTitle = {
  fontSize: '18px',
  margin: '0 0 8px',
}

const ideaHook = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#3b82f6',
}

const ideaDesc = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#4b5563',
}

const ideaWhy = {
  fontSize: '13px',
  color: '#10b981',
}

const ctaSection = {
  padding: '32px',
  backgroundColor: '#f1f5f9',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  marginTop: '16px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const footer = {
  padding: '0 32px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
