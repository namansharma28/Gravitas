"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, CalendarDays, Compass, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl px-6 py-16 text-center space-y-8 bg-transparent"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.1,
              }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Gravitas
                </span>
                <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-400" />
              </h1>
              <p className="mt-4 text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
                Where Communities Connect & Events Come Alive
              </p>
            </motion.div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Discover, join, and engage with vibrant communities. Stay in the loop
              with trending events, updates, and more—all in one beautiful, social
              hub.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/">
                Go to the App
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-2"
                >
                  &rarr;
                </motion.span>
              </Link>
            </Button>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 justify-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center backdrop-blur-md bg-transparent rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full md:w-1/3"
            >
              <Users className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
              <h3 className="font-bold text-lg mb-1">Find Your People</h3>
              <p className="text-sm text-muted-foreground">
                Join communities that match your interests and passions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center backdrop-blur-md bg-transparent rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full md:w-1/3"
            >
              <CalendarDays className="h-10 w-10 text-pink-500 dark:text-pink-400 mb-2" />
              <h3 className="font-bold text-lg mb-1">Never Miss an Event</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with the latest happenings and exclusive events.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center backdrop-blur-md bg-transparent rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full md:w-1/3"
            >
              <Compass className="h-10 w-10 text-cyan-500 dark:text-cyan-400 mb-2" />
              <h3 className="font-bold text-lg mb-1">Explore & Connect</h3>
              <p className="text-sm text-muted-foreground">
                Discover trending communities and make meaningful connections.
              </p>
            </motion.div>
          </div>
        </motion.section>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your communities and events effectively
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards */}
            {[
              {
                icon: <Users className="h-10 w-10 text-purple-500" />,
                title: "Community Management",
                description: "Create and manage vibrant communities with powerful moderation tools."
              },
              {
                icon: <CalendarDays className="h-10 w-10 text-pink-500" />,
                title: "Event Planning",
                description: "Schedule, promote, and manage events with integrated RSVP and ticketing."
              },
              {
                icon: <Compass className="h-10 w-10 text-cyan-500" />,
                title: "Discovery Feed",
                description: "Personalized content feed to discover communities and events you'll love."
              },
              {
                icon: <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-10 w-10 text-yellow-500" />
                </motion.div>,
                title: "Trending Content",
                description: "Stay updated with what's popular and trending across all communities."
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
                title: "Verified Profiles",
                description: "Build trust with verified profiles and community badges."
              },
              {
                icon: <ArrowRight className="h-10 w-10 text-blue-500" />,
                title: "Seamless Integration",
                description: "Connect with your favorite tools and platforms for a unified experience."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="flex flex-col items-center backdrop-blur-md bg-white/80 dark:bg-slate-900/80 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 relative">
        {/* Animated dots pattern - using predefined positions */}
        <div className="absolute inset-0 -z-10 opacity-30">
          {Array.from({ length: 50 }).map((_, i) => {
            // Create a grid of dots with slight variations
            const row = Math.floor(i / 10);
            const col = i % 10;
            return (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-purple-500/30 dark:bg-purple-400/30"
                style={{
                  left: `${col * 10 + 5}%`,
                  top: `${row * 20 + 5}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + (i % 5),
                  repeat: Infinity,
                  delay: i % 3,
                }}
              />
            );
          })}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Trusted by Communities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Join thousands of communities already using Gravitas to connect and grow
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {/* SVG Logos */}
                {[
                  // Tech Community SVG
                  <motion.svg key="tech" viewBox="0 0 100 40" className="h-12 w-full text-slate-400 dark:text-slate-600"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <path d="M10,20 L20,10 L30,20 L20,30 Z" fill="currentColor" />
                    <path d="M35,25 L40,25 M42,25 L47,25 M49,25 L54,25 M56,25 L61,25" stroke="currentColor" strokeWidth="2" />
                  </motion.svg>,
                  
                  // Creative Community SVG
                  <motion.svg key="creative" viewBox="0 0 100 40" className="h-12 w-full text-slate-400 dark:text-slate-600"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <circle cx="20" cy="20" r="10" fill="currentColor" />
                    <path d="M35,25 L40,25 M42,25 L47,25 M49,25 L54,25 M56,25 L61,25" stroke="currentColor" strokeWidth="2" />
                  </motion.svg>,
                  
                  // Education Community SVG
                  <motion.svg key="edu" viewBox="0 0 100 40" className="h-12 w-full text-slate-400 dark:text-slate-600"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <path d="M10,25 L20,15 L30,25 L20,10 Z" fill="currentColor" />
                    <path d="M35,25 L40,25 M42,25 L47,25 M49,25 L54,25 M56,25 L61,25" stroke="currentColor" strokeWidth="2" />
                  </motion.svg>,
                  
                  // Sports Community SVG
                  <motion.svg key="sports" viewBox="0 0 100 40" className="h-12 w-full text-slate-400 dark:text-slate-600"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M35,25 L40,25 M42,25 L47,25 M49,25 L54,25 M56,25 L61,25" stroke="currentColor" strokeWidth="2" />
                  </motion.svg>
                ]}
            </div>
            
            {/* Testimonial */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-16 max-w-3xl mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
            >
              <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-4">
                "Gravitas has transformed how we manage our community events. The platform is intuitive, powerful, and our members love it!"
              </p>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">J</div>
                <div className="ml-4 text-left">
                  <p className="font-semibold">Jamie Chen</p>
                  <p className="text-sm text-muted-foreground">Community Lead, TechHub</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-pink-500/0"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-purple-500/0"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with Gravitas in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-300/50 to-pink-300/50 -z-10" />
            
            {/* Step cards */}
            {[
              {
                number: "01",
                title: "Create Your Profile",
                description: "Sign up and create your personalized profile to start connecting with communities.",
                icon: <Users className="h-8 w-8 text-purple-500" />
              },
              {
                number: "02",
                title: "Join Communities",
                description: "Discover and join communities that match your interests and passions.",
                icon: <Compass className="h-8 w-8 text-pink-500" />
              },
              {
                number: "03",
                title: "Engage & Connect",
                description: "Participate in events, discussions, and build meaningful connections.",
                icon: <Sparkles className="h-8 w-8 text-cyan-500" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 h-full">
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <motion.div 
                      className="inline-block mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {step.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        {/* Animated particles - using predefined positions */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {[
            { size: 80, left: "10%", top: "80%", duration: 15, delay: 0 },
            { size: 120, left: "30%", top: "70%", duration: 18, delay: 2 },
            { size: 90, left: "50%", top: "85%", duration: 12, delay: 1 },
            { size: 100, left: "70%", top: "75%", duration: 20, delay: 3 },
            { size: 70, left: "90%", top: "80%", duration: 16, delay: 2 },
            { size: 110, left: "20%", top: "90%", duration: 14, delay: 4 },
            { size: 85, left: "40%", top: "75%", duration: 17, delay: 1 },
            { size: 95, left: "60%", top: "85%", duration: 19, delay: 0 },
            { size: 75, left: "80%", top: "90%", duration: 13, delay: 3 },
            { size: 105, left: "15%", top: "75%", duration: 16, delay: 2 }
          ].map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-purple-500/20 dark:bg-purple-400/20"
              style={{
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                left: particle.left,
                top: particle.top,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl"
          >
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/10 to-pink-600/0 skew-x-12"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mb-8 text-lg"
            >
              Join thousands of communities already using Gravitas to connect and grow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg shadow-lg"
              >
                <Link href="/">
                  Launch App
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-block ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -left-12 -top-12 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -right-12 -bottom-12 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          </motion.div>
        </div>
      </section>
    </>
  );
}