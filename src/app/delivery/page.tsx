"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Star,
  Navigation,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const deliveryServices = [
  { name: "Yassir Express", logo: "🟢", rating: 4.8, fee: "150-300 DA", time: "30-45 min" },
  { name: "Jumia Food", logo: "🟠", rating: 4.5, fee: "200-400 DA", time: "45-60 min" },
  { name: "Tempo", logo: "🔵", rating: 4.6, fee: "100-250 DA", time: "40-55 min" },
  { name: "Glovo", logo: "🟡", rating: 4.7, fee: "180-350 DA", time: "35-50 min" },
];

const deliveryZones = [
  { wilaya: "Alger", communes: ["Alger Centre", "Bab El Oued", "El Biar", "Hussein Dey", "Kouba", "Bir Mourad Rais"], baseFee: 150 },
  { wilaya: "Oran", communes: ["Oran Centre", "Bir El Djir", "Es Senia", "Arzew"], baseFee: 150 },
  { wilaya: "Constantine", communes: ["Constantine Centre", "El Khroub", "Ain Smara"], baseFee: 180 },
];

export default function DeliveryPage() {
  const { language, user, orders } = useAppStore();
  const [activeTab, setActiveTab] = useState<"track" | "new">("track");

  const sampleOrders = [
    {
      id: "ORD-2024-001",
      status: "shipped",
      pharmacy: "Pharmacy Central",
      items: 3,
      total: 1250,
      deliveryFee: 200,
      estimatedTime: "14:30 - 15:00",
      driver: "Ahmed B.",
      driverPhone: "0551234567",
      progress: 65,
      address: "123 Rue Didouche Mourad, Alger Centre",
      steps: [
        { label: "Commande confirmée", done: true, time: "13:45" },
        { label: "Préparation", done: true, time: "13:55" },
        { label: "En route", done: true, time: "14:15" },
        { label: "Livré", done: false, time: "" },
      ],
    },
    {
      id: "ORD-2024-002",
      status: "delivered",
      pharmacy: "Pharmacy El Hakim",
      items: 2,
      total: 890,
      deliveryFee: 150,
      estimatedTime: "Livré",
      driver: "Karim M.",
      driverPhone: "",
      progress: 100,
      address: "45 Boulevard Front de Mer, Oran",
      steps: [
        { label: "Commande confirmée", done: true, time: "10:00" },
        { label: "Préparation", done: true, time: "10:15" },
        { label: "En route", done: true, time: "10:30" },
        { label: "Livré", done: true, time: "11:05" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t(language, "delivery")}</h1>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "تتبع طلباتك والتوصيل إلى باب منزلك"
                  : language === "en"
                  ? "Track your orders and get delivery to your doorstep"
                  : "Suivez vos commandes et faites-vous livrer à domicile"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "track" ? "default" : "outline"}
            onClick={() => setActiveTab("track")}
            className={activeTab === "track" ? "bg-gradient-to-r from-primary to-accent" : ""}
          >
            <Package className="w-4 h-4 mr-2" />
            {language === "ar" ? "تتبع الطلبات" : language === "en" ? "Track Orders" : "Suivre commandes"}
          </Button>
          <Button
            variant={activeTab === "new" ? "default" : "outline"}
            onClick={() => setActiveTab("new")}
            className={activeTab === "new" ? "bg-gradient-to-r from-primary to-accent" : ""}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {language === "ar" ? "طلب جديد" : language === "en" ? "New Order" : "Nouvelle commande"}
          </Button>
        </div>

        {activeTab === "track" && (
          <div className="space-y-6">
            {sampleOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{order.id}</h3>
                      <Badge className={
                        order.status === "delivered" ? "bg-green-500" :
                        order.status === "shipped" ? "bg-blue-500" :
                        order.status === "confirmed" ? "bg-yellow-500" : "bg-gray-500"
                      }>
                        {order.status === "delivered" 
                          ? (language === "ar" ? "تم التسليم" : language === "en" ? "Delivered" : "Livré")
                          : order.status === "shipped"
                          ? (language === "ar" ? "في الطريق" : language === "en" ? "On the way" : "En route")
                          : (language === "ar" ? "مؤكد" : language === "en" ? "Confirmed" : "Confirmé")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{order.pharmacy}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{order.total + order.deliveryFee} DA</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} {language === "ar" ? "منتجات" : "articles"} + {order.deliveryFee} DA {language === "ar" ? "توصيل" : "livraison"}
                    </p>
                  </div>
                </div>

                {order.status === "shipped" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {language === "ar" ? "التقدم" : language === "en" ? "Progress" : "Progression"}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.estimatedTime}
                      </span>
                    </div>
                    <Progress value={order.progress} className="h-2 mb-4" />
                    
                    <div className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{order.driver}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "السائق" : language === "en" ? "Driver" : "Livreur"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        {language === "ar" ? "اتصل" : language === "en" ? "Call" : "Appeler"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {order.steps.map((step, j) => (
                    <div key={j} className="text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        step.done ? "bg-green-500" : "bg-muted"
                      }`}>
                        {step.done ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs text-muted-foreground">{j + 1}</span>
                        )}
                      </div>
                      <p className="text-xs font-medium">{step.label}</p>
                      {step.time && <p className="text-xs text-muted-foreground">{step.time}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "new" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {language === "ar" ? "خدمات التوصيل" : language === "en" ? "Delivery Services" : "Services de livraison"}
              </h2>
              <div className="space-y-3">
                {deliveryServices.map((service, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.logo}</span>
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{service.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{service.fee}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {language === "ar" ? "مناطق التوصيل" : language === "en" ? "Delivery Zones" : "Zones de livraison"}
              </h2>
              <div className="space-y-4">
                {deliveryZones.map((zone, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{zone.wilaya}</h4>
                      <Badge variant="outline">{zone.baseFee} DA</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {zone.communes.map((commune, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">{commune}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">
                      {language === "ar" ? "ملاحظة" : language === "en" ? "Note" : "Note"}
                    </p>
                    <p>
                      {language === "ar"
                        ? "رسوم التوصيل قد تختلف حسب المسافة ووقت الطلب"
                        : language === "en"
                        ? "Delivery fees may vary based on distance and order time"
                        : "Les frais de livraison peuvent varier selon la distance et l'heure de commande"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

