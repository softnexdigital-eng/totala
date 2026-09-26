'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Search,
  MapPin,
  ChevronDown,
  Stethoscope,
  Hospital,
  FlaskConical,
  Ambulance,
  Pill,
  Droplets,
  HouseHeart,
  BadgePercent,
  ShieldCheck,
  Clock3,
  Star,
  Phone,
  CheckCircle2,
  Menu,
  X,
  HeartPulse,
  Activity,
  Users,
  Building2,
  Sparkles,
  CalendarCheck,
  Car,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AgentCard from '@/components/booking/AgentCard';
import BookNowModal from '@/components/booking/BookNowModal';
import TransportBookingModal from '@/components/booking/TransportBookingModal';
import type { AgentProfile } from '@/types';

const services = [
  {
    title: 'ডাক্তার',
    subtitle: 'বিশেষজ্ঞ ডাক্তার খুঁজুন',
    icon: Stethoscope,
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85',
    href: '/doctors',
  },
  {
    title: 'হাসপাতাল ও ক্লিনিক',
    subtitle: 'কাছাকাছি হাসপাতাল দেখুন',
    icon: Hospital,
    image:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=85',
    href: '/hospitals',
  },
  {
    title: 'ডায়াগনস্টিক',
    subtitle: 'টেস্ট ও ল্যাব খুঁজুন',
    icon: FlaskConical,
    image:
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85',
    href: '/diagnostics',
  },
  {
    title: 'যানবাহন বুকিং',
    subtitle: 'অ্যাম্বুলেন্স, কার, সিএনজি সেবা',
    icon: Car,
    image:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=85',
    href: '#transport',
  },
  {
    title: 'ফার্মেসি',
    subtitle: 'ফার্মেসির তথ্য খুঁজুন',
    icon: Pill,
    image:
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=900&q=85',
    href: '/pharmacies',
  },
  {
    title: 'ব্লাড সার্ভিস',
    subtitle: 'রক্ত সংক্রান্ত তথ্য',
    icon: Droplets,
    image:
      'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=900&q=85',
    href: '/blood',
  },
  {
    title: 'হোম হেলথকেয়ার',
    subtitle: 'বাড়িতে স্বাস্থ্যসেবা',
    icon: HouseHeart,
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85',
    href: '/home-service',
  },
  {
    title: 'প্যাকেজ ও অফার',
    subtitle: 'স্বাস্থ্যসেবার সেরা অফার',
    icon: BadgePercent,
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=85',
    href: '/packages',
  },
];

const popularDoctors = [
  {
    name: 'Dr. Ahmed Rahman',
    specialty: 'Medicine Specialist',
    hospital: 'Popular Medical Center',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Dr. Sarah Islam',
    specialty: 'Gynecology Specialist',
    hospital: 'City Hospital',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Dr. Mahmud Hasan',
    specialty: 'Cardiology Specialist',
    hospital: 'Central Hospital',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=85',
  },
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [transportVehicle, setTransportVehicle] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public-agents', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAgents(data.data || []);
        }
        setLoadingAgents(false);
      })
      .catch(() => {
        setLoadingAgents(false);
      });
  }, []);

  // Same filtering rule the public agents directory uses, so both views stay in sync.
  const activeAgents = agents.filter((agent) => agent.isActive !== false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-lg shadow-emerald-600/20">
              <HeartPulse className="h-6 w-6" strokeWidth={2.2} />
              <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
            </div>

            <div>
              <div className="text-[23px] font-black tracking-tight text-slate-900">
                Dak<span className="text-emerald-600">Din</span>
              </div>
              <div className="-mt-1 text-[8px] font-bold tracking-[0.28em] text-slate-400">
                Sheba Nin
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#services"
              className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
            >
              সেবাসমূহ
            </a>

            <a
              href="#doctors"
              className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
            >
              ডাক্তার
            </a>

            <Link
              href="/public-agents"
              className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
            >
              Agents
            </Link>

            <a
              href="#how"
              className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
            >
              কীভাবে কাজ করে
            </a>

            <a
              href="#providers"
              className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
            >
              Provider
            </a>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="hidden rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-emerald-600 sm:block"
            >
              Join DakDin
            </Link>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            >
              {mobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              <a href="#services" onClick={() => setMobileMenu(false)}>
                সেবাসমূহ
              </a>
              <a href="#doctors" onClick={() => setMobileMenu(false)}>
                ডাক্তার
              </a>
              <Link href="/public-agents" onClick={() => setMobileMenu(false)}>
                Agents
              </Link>
              <a href="#how" onClick={() => setMobileMenu(false)}>
                কীভাবে কাজ করে
              </a>
              <a href="#providers" onClick={() => setMobileMenu(false)}>
                Provider
              </a>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-bold"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white"
                >
                  Join DakDin
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>


      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 pt-[76px]">

        {/* Background decorations */}
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-green-200/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">

          {/* Hero Content */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 sm:text-sm">
                আপনার স্বাস্থ্যসেবার তথ্য এক জায়গায়
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[64px]">
              প্রয়োজনীয় স্বাস্থ্যসেবা
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                খুঁজে নিন সহজেই।
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              ডাক্তার, হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক, অ্যাম্বুলেন্স,
              ফার্মেসি ও বিভিন্ন স্বাস্থ্যসেবার প্রয়োজনীয় তথ্য
              একটি সহজ প্ল্যাটফর্মে খুঁজে নিন।
            </p>


            {/* Search */}
            <div className="mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5">

              <div className="flex flex-col gap-2 md:flex-row">

                <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />

                  <input
                    type="text"
                    placeholder="ডাক্তার, হাসপাতাল, ডায়াগনস্টিক..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3.5 md:w-40">
                  <MapPin className="h-5 w-5 text-emerald-600" />

                  <span className="text-sm text-slate-500">
                    Location
                  </span>

                  <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                </div>

                <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
                  <Search className="h-4 w-4" />
                  Search
                </button>

              </div>
            </div>


            {/* Trust */}
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">

              {[
                'সহজে তথ্য খুঁজুন',
                'দ্রুত যোগাযোগ',
                'এক প্ল্যাটফর্মে',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}

            </div>

          </div>


          {/* Hero Visual */}
          <div className="relative mx-auto w-full max-w-[550px]">

            {/* Main Image */}
            <div className="relative overflow-hidden rounded-[32px] border-8 border-white shadow-2xl shadow-emerald-900/10">

              <div className="relative aspect-[4/4.5]">

                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1100&q=90"
                  alt="Healthcare professional"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 550px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                {/* Image caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-emerald-600 shadow-xl">
                      <HeartPulse className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Healthcare Information
                      </p>

                      <p className="mt-1 text-xs text-white/75">
                        Find the care you need
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            </div>


            {/* Floating Card 1 */}
            <div className="absolute -left-5 top-16 hidden rounded-2xl border border-white bg-white/95 p-4 shadow-2xl backdrop-blur sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <div className="text-xs text-slate-400">
                    Doctors
                  </div>
                  <div className="text-lg font-black">
                    100+
                  </div>
                </div>

              </div>

            </div>


            {/* Floating Card 2 */}
            <div className="absolute -right-5 bottom-16 hidden rounded-2xl border border-white bg-white/95 p-4 shadow-2xl backdrop-blur sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>

                <div>
                  <div className="text-xs text-slate-400">
                    User Rating
                  </div>
                  <div className="text-lg font-black">
                    4.9/5
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="border-y border-slate-100 bg-white">

        <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4">

          {[
            [Users, '100+', 'ডাক্তার'],
            [Building2, '50+', 'হাসপাতাল ও ক্লিনিক'],
            [FlaskConical, '100+', 'ডায়াগনস্টিক সেবা'],
            [Clock3, '24/7', 'তথ্য অ্যাক্সেস'],
          ].map(([Icon, number, label]) => {

            const StatIcon = Icon as any;

            return (
              <div
                key={label as string}
                className="border-r border-slate-100 px-4 py-8 text-center last:border-r-0"
              >
                <StatIcon className="mx-auto mb-3 h-5 w-5 text-emerald-600" />

                <div className="text-2xl font-black text-slate-900">
                  {number as string}
                </div>

                <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {label as string}
                </div>
              </div>
            );
          })}

        </div>

      </section>


      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section
        id="services"
        className="bg-slate-50 px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
                <Activity className="h-4 w-4" />
                Our Services
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                প্রয়োজনীয় সেবা,
                <br />
                <span className="text-emerald-600">
                  এক জায়গায়।
                </span>
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                আপনার প্রয়োজন অনুযায়ী স্বাস্থ্যসেবা ও
                সেবাদানকারীর তথ্য সহজেই খুঁজে নিন।
              </p>
            </div>

            <Link
              href="/services"
              className="flex w-fit items-center gap-2 text-sm font-bold text-emerald-600 transition hover:gap-3"
            >
              সকল সেবা দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>


          {/* Service Cards */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {services.map((service) => {

              const Icon = service.icon;
              const isTransport = service.href === '#transport';

              if (isTransport) {
                return (
                  <button
                    key={service.title}
                    onClick={() => setTransportVehicle('car')}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/10 text-left"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
                      <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-emerald-600 shadow-lg backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-lg font-black">{service.title}</div>
                        <div className="mt-1 text-xs text-white/75">{service.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <span className="text-sm font-bold text-slate-700">বুক করুন</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 transition group-hover:bg-emerald-600 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  href={service.href}
                  key={service.title}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
                    <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-emerald-600 shadow-lg backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-lg font-black">{service.title}</div>
                      <div className="mt-1 text-xs text-white/75">{service.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm font-bold text-slate-700">বিস্তারিত দেখুন</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 transition group-hover:bg-emerald-600 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          WHY DAKDIN
      ========================================================= */}
      <section className="px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          {/* Image */}
          <div className="relative">

            <div className="relative overflow-hidden rounded-[32px] shadow-2xl">

              <Image
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=90"
                alt="Healthcare"
                width={1200}
                height={900}
                className="h-[450px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

              <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <ShieldCheck className="h-8 w-8" />

                  <div>
                    <div className="font-bold">
                      Information First
                    </div>

                    <div className="mt-1 text-xs text-white/70">
                      সহজে প্রয়োজনীয় তথ্য খুঁজুন
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* Content */}
          <div>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
              <HeartPulse className="h-4 w-4" />
              Why DakDin
            </div>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              স্বাস্থ্যসেবার তথ্য খোঁজা
              <br />
              <span className="text-emerald-600">
                আরও সহজ হোক।
              </span>
            </h2>

            <p className="mt-5 leading-8 text-slate-500">
              DakDin তৈরি করা হয়েছে যেন প্রয়োজনের সময়
              সঠিক স্বাস্থ্যসেবার তথ্য খুঁজে পেতে আপনাকে
              বিভিন্ন জায়গায় ঘুরতে না হয়।
            </p>


            <div className="mt-8 space-y-5">

              {[
                [
                  Search,
                  'সহজ Search',
                  'একটি search থেকেই আপনার প্রয়োজনীয় সেবা খুঁজে নিন।',
                ],
                [
                  MapPin,
                  'Location Based',
                  'আপনার পছন্দের এলাকার সেবা ও প্রতিষ্ঠান খুঁজুন।',
                ],
                [
                  ShieldCheck,
                  'তথ্যভিত্তিক প্ল্যাটফর্ম',
                  'সেবাদানকারীদের প্রয়োজনীয় তথ্য এক জায়গায় দেখুন।',
                ],
                [
                  Phone,
                  'দ্রুত যোগাযোগ',
                  'প্রয়োজন অনুযায়ী সংশ্লিষ্ট সেবাদানকারীর সাথে যোগাযোগ করুন।',
                ],
              ].map(([Icon, title, text]) => {

                const FeatureIcon = Icon as any;

                return (
                  <div key={title as string} className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FeatureIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold">
                        {title as string}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {text as string}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          DOCTORS
      ========================================================= */}
      <section
        id="doctors"
        className="bg-slate-950 px-5 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
                <Stethoscope className="h-4 w-4" />
                Find Doctors
              </div>

              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                বিশেষজ্ঞ ডাক্তার
                <br />
                <span className="text-emerald-400">
                  খুঁজে নিন।
                </span>
              </h2>

            </div>

            <Link
              href="/doctors"
              className="flex w-fit items-center gap-2 text-sm font-bold text-emerald-400"
            >
              সকল ডাক্তার
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            {popularDoctors.map((doctor) => (

              <div
                key={doctor.name}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur"
              >

                <div className="relative aspect-[4/3]">

                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {doctor.rating}
                  </div>

                </div>


                <div className="p-5">

                  <h3 className="font-bold">
                    {doctor.name}
                  </h3>

                  <p className="mt-1 text-sm text-emerald-400">
                    {doctor.specialty}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {doctor.hospital}
                  </p>

                  <Link
                    href="/doctors"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-bold transition hover:bg-emerald-600"
                  >
                    Profile দেখুন
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          OUR AGENTS
      ========================================================= */}
      <section className="bg-slate-50 px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
                <Users className="h-4 w-4" />
                Our Agents
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                আপনার সেবার জন্য
                <br />
                <span className="text-emerald-600">
                  নির্দেশিত এজেন্ট।
                </span>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                আমাদের অত্যন্ত সুনিয়ন্ত্রিত এবং রেটিংযুক্ত এজেন্ট সেবা নিশ্চিত করুন
              </p>
            </div>
            <Link
              href="/public-agents"
              className="flex w-fit items-center gap-2 text-sm font-bold text-emerald-600 transition hover:gap-3"
            >
              সকল এজেন্ট দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingAgents ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
              </div>
            ) : activeAgents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No agents available at the moment
              </div>
            ) : (
              activeAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onBookNow={setSelectedAgent}
                />
              ))
            )}
          </div>
        </div>
      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how"
        className="px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
      >

        <div className="mx-auto max-w-6xl text-center">

          <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
            Simple Process
          </div>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            DakDin ব্যবহার করবেন যেভাবে
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
            কয়েকটি সহজ ধাপে আপনার প্রয়োজনীয় স্বাস্থ্যসেবার
            তথ্য খুঁজে নিন।
          </p>


          <div className="mt-14 grid gap-10 md:grid-cols-3">

            {[
              [
                '01',
                Search,
                'খুঁজুন',
                'ডাক্তার, হাসপাতাল, ডায়াগনস্টিক বা আপনার প্রয়োজনীয় সেবা খুঁজুন।',
              ],
              [
                '02',
                CalendarCheck,
                'তথ্য দেখুন',
                'সেবাদানকারীর প্রোফাইল, সেবা, location ও যোগাযোগের তথ্য দেখুন।',
              ],
              [
                '03',
                Phone,
                'যোগাযোগ করুন',
                'প্রয়োজন অনুযায়ী সরাসরি সংশ্লিষ্ট সেবাদানকারীর সাথে যোগাযোগ করুন।',
              ],
            ].map(([number, Icon, title, text]) => {

              const StepIcon = Icon as any;

              return (
                <div key={number as string} className="relative">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                    <StepIcon className="h-8 w-8" />
                  </div>

                  <div className="mt-5 text-xs font-black tracking-widest text-emerald-600">
                    STEP {number as string}
                  </div>

                  <h3 className="mt-2 text-xl font-black">
                    {title as string}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-500">
                    {text as string}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          PROVIDER CTA
      ========================================================= */}
      <section
        id="providers"
        className="px-5 pb-20 sm:px-6 lg:px-8 lg:pb-28"
      >

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">

          <div className="grid items-center lg:grid-cols-2">

            <div className="px-7 py-14 sm:px-10 lg:px-16 lg:py-20">

              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">
                <Building2 className="h-4 w-4" />
                For Healthcare Providers
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
                আপনার স্বাস্থ্যসেবা
                <br />
                আরও মানুষের কাছে পৌঁছান।
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-emerald-50">
                ডাক্তার, হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক বা
                অন্য কোনো স্বাস্থ্যসেবা প্রদানকারী হিসেবে
                DakDin-এ আপনার তথ্য যুক্ত করুন।
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/provider"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-emerald-700 shadow-xl transition hover:bg-emerald-50"
                >
                  আপনার প্রতিষ্ঠান যুক্ত করুন
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/provider"
                  className="flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Learn More
                </Link>

              </div>

            </div>


            <div className="relative hidden min-h-[430px] lg:block">

              <Image
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1100&q=90"
                alt="Healthcare provider"
                fill
                className="object-cover"
                sizes="50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-600/20 to-transparent" />

              <div className="absolute bottom-10 right-10 rounded-2xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600">
                    <Users className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="font-bold">
                      Grow with DakDin
                    </div>

                    <div className="mt-1 text-xs text-white/75">
                      Reach more people
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-5 pb-20 text-center sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <HeartPulse className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-3xl font-black sm:text-4xl">
            প্রয়োজনের সময়
            <span className="text-emerald-600"> DakDin</span>
            -এর সাথে থাকুন।
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
            প্রয়োজনীয় স্বাস্থ্যসেবার তথ্য খুঁজে পাওয়া হোক
            আরও সহজ, দ্রুত ও সুবিধাজনক।
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/doctors"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              ডাক্তার খুঁজুন
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/services"
              className="rounded-xl border border-slate-200 px-7 py-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
            >
              সকল সেবা
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-slate-950 px-5 py-14 text-slate-400 sm:px-6 lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">

            <Link href="/" className="inline-flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <HeartPulse className="h-6 w-6" />
              </div>

              <div>
                <div className="text-2xl font-black text-white">
                  Dak<span className="text-emerald-400">Din</span>
                </div>
                <div className="text-[8px] font-bold tracking-[0.28em] text-slate-500">
                  HEALTH & SERVICES
                </div>
              </div>

            </Link>

            <p className="mt-5 max-w-md text-sm leading-7">
              প্রয়োজনীয় স্বাস্থ্যসেবার তথ্য সহজে খুঁজে
              পাওয়ার একটি আধুনিক ডিজিটাল প্ল্যাটফর্ম।
            </p>

          </div>


          {/* Links */}
          <div>

            <h4 className="font-bold text-white">
              Explore
            </h4>

            <div className="mt-5 space-y-3 text-sm">

              <Link href="/doctors" className="block hover:text-white">
                ডাক্তার
              </Link>

              <Link href="/hospitals" className="block hover:text-white">
                হাসপাতাল
              </Link>

              <Link href="/diagnostics" className="block hover:text-white">
                ডায়াগনস্টিক
              </Link>

              <Link href="/services" className="block hover:text-white">
                সকল সেবা
              </Link>

            </div>

          </div>


          {/* Contact */}
          <div>

            <h4 className="font-bold text-white">
              যোগাযোগ
            </h4>

            <div className="mt-5 space-y-4 text-sm">

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+880 1XXXXXXXXX</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Bangladesh</span>
              </div>

            </div>

          </div>

        </div>


        <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs sm:flex-row">

          <p>
            © 2026 DakDin. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>

        </div>

      </footer>

      {/* Book Now modal — identical booking flow to the /public-agents directory */}
      {selectedAgent && (
        <BookNowModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Transport booking modal */}
      {transportVehicle && (
        <TransportBookingModal
          vehicleType={transportVehicle}
          onClose={() => setTransportVehicle(null)}
        />
      )}

    </main>
  );
}