"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "../ContactForm";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { config } from "@/data/config";
const ContactSection = () => {
  return (
    <section id="contact" className="min-h-screen max-w-7xl mx-auto relative z-10 px-4 md:px-8">
      <Link href={"#contact"}>
        <h2
          className={cn(
            "bg-clip-text text-4xl text-center text-transparent md:text-7xl pt-24 md:pt-32",
            "bg-gradient-to-b from-black/80 to-black/50",
            "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20 dark:bg-opacity-50"
          )}
        >
          LET&apos;S WORK <br />
          TOGETHER
        </h2>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 md:mt-20">
        <Card className="w-full bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-4xl">Contact Form</CardTitle>
            <CardDescription>
              Please contact me directly at{" "}
              <a
                target="_blank"
                href={`mailto:${config.email}`}
                className="text-primary hover:text-primary/80 underline cursor-can-hover rounded-lg transition-colors"
              >
                {config.email}
              </a>{" "}
              or drop your info here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        {/* Right column intentionally empty - keyboard appears here via AnimatedBackground */}
      </div>
    </section>
  );
};
export default ContactSection;
