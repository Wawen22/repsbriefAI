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
} from '@react-email/components'
import * as React from 'react'
import { IdeaObject } from '@/types/niche'

interface WeeklyBriefEmailProps {
  nicheLabel: string
  ideas: IdeaObject[]
  userName?: string
}

export const WeeklyBriefEmail = ({
  nicheLabel,
  ideas,
  userName = 'Creator'
}: WeeklyBriefEmailProps) => {
  // Prendiamo solo le prime 5 idee per l'email per non renderla troppo lunga
  const featuredIdeas = ideas.slice(0, 5);

  return (
    <Html>
      <Head />
      <Preview>Your {nicheLabel} strategies for this week are ready 🚀</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandLabel}>REPSBRIEF STUDIO</Text>
            <Heading style={h1}>The Weekly Brief</Heading>
            <Text style={subtitle}>Hi {userName}, your strategic reps for <strong>{nicheLabel}</strong> are finalized and ready to deploy.</Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={sectionTitle}>FEATURED STRATEGIES</Text>
            
            {featuredIdeas.map((idea, index) => (
              <Section key={index} style={ideaCard}>
                <Text style={formatBadge}>{idea.format.toUpperCase()}</Text>
                <Heading style={ideaTitle}>{idea.title}</Heading>
                <Text style={ideaHook}>&ldquo;{idea.hook}&rdquo;</Text>
                <Link href="https://repsbrief.com/dashboard" style={readMoreLink}>
                  View Full Script & Remix with AI →
                </Link>
              </Section>
            ))}

            <Section style={centerSection}>
              <Link href="https://repsbrief.com/dashboard" style={button}>
                Explore All 20 Ideas
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Sent with ⚡️ from RepsBrief Studio <br />
              © 2026 RepsBrief. All rights reserved. <br />
              <Link href="https://repsbrief.com/dashboard/settings" style={footerLink}>
                Manage email preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#050505',
  color: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
}

const container = {
  backgroundColor: '#050505',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const headerSection = {
  textAlign: 'center' as const,
  paddingBottom: '40px',
}

const brandLabel = {
  color: '#3b82f6',
  fontSize: '10px',
  fontWeight: '900',
  letterSpacing: '0.2em',
  margin: '0 0 10px 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '900',
  margin: '0',
  letterSpacing: '-0.02em',
}

const subtitle = {
  color: '#94a3b8',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0 0',
}

const contentSection = {
  padding: '0 0 40px',
}

const sectionTitle = {
  color: '#475569',
  fontSize: '10px',
  fontWeight: '900',
  letterSpacing: '0.3em',
  marginBottom: '24px',
}

const ideaCard = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
}

const formatBadge = {
  color: '#3b82f6',
  fontSize: '9px',
  fontWeight: '900',
  letterSpacing: '0.1em',
  margin: '0 0 8px 0',
}

const ideaTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px 0',
}

const ideaHook = {
  color: '#e2e8f0',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const readMoreLink = {
  color: '#3b82f6',
  fontSize: '12px',
  fontWeight: '700',
  textDecoration: 'none',
}

const centerSection = {
  textAlign: 'center' as const,
  paddingTop: '20px',
}

const button = {
  backgroundColor: '#ffffff',
  borderRadius: '9999px',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '900',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
}

const hr = {
  borderColor: '#1e293b',
  margin: '40px 0',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#475569',
  lineHeight: '20px',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
