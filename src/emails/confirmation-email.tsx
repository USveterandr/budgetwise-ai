import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface ConfirmationEmailProps {
  name: string;
  confirmationUrl: string;
}

export const ConfirmationEmail = ({
  name = 'there',
  confirmationUrl = 'https://budgetwise-ai.pages.dev/auth/confirm-email?token=1234567890',
}: ConfirmationEmailProps) => {
  const previewText = `Welcome to BudgetWise, ${name}! Please confirm your email address.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://budgetwise-ai.pages.dev/logo.png"
                width="40"
                height="37"
                alt="BudgetWise"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>BudgetWise</strong>!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for signing up for BudgetWise! We{`'`}re excited to help you take control of your finances with our AI-powered platform.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmationUrl}
              >
                Confirm Email Address
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={confirmationUrl} className="text-blue-600 no-underline">
                {confirmationUrl}
              </Link>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you didn{`'`}t create an account with us, you can safely ignore this email.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards,<br />
              The BudgetWise Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ConfirmationEmail;