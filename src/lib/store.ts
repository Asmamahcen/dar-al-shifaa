import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './i18n';
import { createClient } from './supabase';

export type UserRole = 'patient' | 'doctor' | 'pharmacy' | 'school' | 'factory' | 'trainer' | 'creator' | 'cnas' | 'admin';
export type SubscriptionPlan = 'free' | 'premium' | 'professional' | 'enterprise';

export interface Factory {
  id: string;
  name: string;
  nameAr: string;
  ownerId: string;
  wilaya: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  nameAr: string;
  ownerId: string;
  wilaya: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface MedicalDossier {
  id: string;
  patientId: string;
  bloodType: string;
  allergies: string[];
  chronicDiseases: string[];
  lastCheckup: string;
  history: { date: string; diagnosis: string; doctorId: string; notes: string }[];
  notes: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  plan: SubscriptionPlan;
  wilaya: string;
  city: string;
  address: string;
    verified: boolean;
    pharmacyId?: string;
    factoryId?: string;
    schoolId?: string;
    ccpReceiptUrl?: string; // For payments
  specialty?: string; // For doctors
  licenseNumber?: string;
  isApproved: boolean; // For admin validation
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  nameAr: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  batchNumber: string;
  barcode: string;
  description: string;
  requiresPrescription: boolean;
  pharmacyId: string;
  isDonation?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  nameAr: string;
  ownerId: string;
  wilaya: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  openingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  isOpen24h: boolean;
  hasDelivery: boolean;
  plan: SubscriptionPlan;
  verified: boolean;
  branches: string[];
}

export interface Order {
  id: string;
  userId: string;
  pharmacyId: string;
  items: { medicineId: string; quantity: number; price: number }[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  trainerId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  modules: {
    id: string;
    title: string;
    content: string;
    videoUrl?: string;
    quiz?: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
  }[];
  certificateTemplate: string;
  materialsUrls: string[];
  price: number;
  isFree: boolean;
  zoomUrl?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  role: string;
  roleType: 'doctor' | 'pharmacy' | 'factory' | 'trainer' | 'other';
  location: string;
  salary: string;
  publisherId: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  patientCNAS: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  cnasEligible: boolean;
  stamped: boolean;
  notes: string;
  createdAt: string;
}

export interface ProductionLine {
  id: string;
  factoryId: string;
  name: string;
  medicineName: string;
  status: 'active' | 'maintenance' | 'stopped';
  progress: number;
  dailyOutput: number;
  createdAt: string;
}

export interface FactoryInventory {
  id: string;
  factoryId: string;
  medicineName: string;
  quantity: number;
  price: number;
  batchNumber: string;
  expiryDate: string;
  createdAt: string;
}

export interface FactoryOrder {
  id: string;
  pharmacyId: string;
  factoryId: string;
  items: { medicineName: string; quantity: number; price: number }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  totalAmount: number;
  createdAt: string;
}

export interface CNASStatus {
  userId: string;
  cnasNumber: string;
  isInsured: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface TrainingEnrollment {
  id: string;
  courseId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  grade?: string;
  certificateUrl?: string;
  createdAt: string;
}

export interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  user: User | null;
  setUser: (user: User | null) => void;
  
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  
  enrollments: TrainingEnrollment[];
  addEnrollment: (enrollment: Omit<TrainingEnrollment, 'id' | 'createdAt'>) => Promise<void>;
  updateEnrollment: (id: string, data: Partial<TrainingEnrollment>) => Promise<void>;
  
  pharmacies: Pharmacy[];
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id' | 'branches' | 'latitude' | 'longitude' | 'openingHours' | 'plan' | 'verified'>) => Promise<void>;
  updatePharmacy: (id: string, data: Partial<Pharmacy>) => void;
  deletePharmacy: (id: string) => Promise<void>;

  factories: Factory[];
  addFactory: (factory: Omit<Factory, 'id' | 'createdAt'>) => Promise<void>;
  updateFactory: (id: string, data: Partial<Factory>) => Promise<void>;
  deleteFactory: (id: string) => Promise<void>;

  schools: School[];
  addSchool: (school: Omit<School, 'id' | 'createdAt'>) => Promise<void>;
  updateSchool: (id: string, data: Partial<School>) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  
  medicines: Medicine[];
  addMedicine: (medicine: Medicine) => Promise<void>;
  updateMedicine: (id: string, data: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  importMedicines: (medicines: Medicine[]) => void;
  
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  
  courses: Course[];
  userProgress: { [courseId: string]: { completed: number[]; score: number } };
  updateProgress: (courseId: string, moduleIndex: number, score?: number) => void;
    addCourse: (course: Course) => Promise<void>;
  
    jobOffers: JobOffer[];
    addJobOffer: (offer: Omit<JobOffer, 'id' | 'createdAt'>) => Promise<void>;
    deleteJobOffer: (id: string) => Promise<void>;
    updateJobOffer: (id: string, data: Partial<JobOffer>) => Promise<void>;
    
    prescriptions: Prescription[];

  medicalDossiers: MedicalDossier[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => Promise<void>;
  updateMedicalDossier: (dossier: MedicalDossier) => Promise<void>;
  addMedicalDossier: (dossier: Omit<MedicalDossier, 'id'>) => Promise<void>;
  
  productionLines: ProductionLine[];
  addProductionLine: (line: Omit<ProductionLine, 'id' | 'createdAt'>) => Promise<void>;
  updateProductionLine: (id: string, data: Partial<ProductionLine>) => Promise<void>;
  deleteProductionLine: (id: string) => Promise<void>;
  
  factoryInventory: FactoryInventory[];
  addFactoryInventory: (item: Omit<FactoryInventory, 'id' | 'createdAt'>) => Promise<void>;

  factoryOrders: FactoryOrder[];
  addFactoryOrder: (order: Omit<FactoryOrder, 'id' | 'createdAt'>) => Promise<void>;
  updateFactoryOrder: (id: string, data: Partial<FactoryOrder>) => Promise<void>;

  cnasStatuses: { [userId: string]: CNASStatus };
  updateCNASStatus: (status: CNASStatus) => Promise<void>;
  
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  notifications: { id: string; message: string; type: string; read: boolean; createdAt: string }[];
  addNotification: (notification: { message: string; type: string }) => void;
  markNotificationRead: (id: string) => void;

  deleteUser: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteEnrollment: (id: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  fetchInitialData: () => Promise<void>;
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      setLanguage: (lang) => set({ language: lang }),
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      user: null,
      setUser: (user) => set({ user }),
      
      users: [],
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
          updateUser: async (id, data) => {
            const supabase = createClient();
            const updateData: any = {};
            if (data.isApproved !== undefined) updateData.is_approved = data.isApproved;
            if (data.verified !== undefined) updateData.verified = data.verified;
            if (data.fullName) updateData.full_name = data.fullName;
            if (data.phone) updateData.phone = data.phone;
            if (data.plan) updateData.plan = data.plan;
            if (data.specialty) updateData.specialty = data.specialty;
            if (data.licenseNumber) updateData.license_number = data.licenseNumber;
            if (data.address) updateData.address = data.address;
            if (data.wilaya) updateData.wilaya = data.wilaya;
            if (data.city) updateData.city = data.city;
            
            const { error } = await supabase.from('users').update(updateData).eq('id', id);
            if (!error) {
              set((state) => ({
                users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
                user: state.user?.id === id ? { ...state.user, ...data } : state.user,
              }));
              // toast.success("Profil mis à jour"); // Removed to avoid double toast with UI
            }
          },

      appointments: [],
      addAppointment: async (appointment) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('appointments').insert({
          doctor_id: appointment.doctorId,
          patient_id: appointment.patientId,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          notes: appointment.notes
        }).select().single();
        if (!error && data) set((state) => ({ appointments: [...state.appointments, {
          id: data.id,
          doctorId: data.doctor_id,
          patientId: data.patient_id,
          date: data.date,
          time: data.time,
          status: data.status,
          notes: data.notes,
          createdAt: data.created_at
        }] }));
      },
      updateAppointment: async (id, data) => {
        const supabase = createClient();
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.notes) updateData.notes = data.notes;
        const { error } = await supabase.from('appointments').update(updateData).eq('id', id);
        if (!error) set((state) => ({
          appointments: state.appointments.map(a => a.id === id ? { ...a, ...data } : a)
        }));
      },

      enrollments: [],
      addEnrollment: async (enrollment) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('enrollments').insert({
          course_id: enrollment.courseId,
          user_id: enrollment.userId,
          status: enrollment.status
        }).select().single();
        if (!error && data) set((state) => ({ enrollments: [...state.enrollments, {
          id: data.id,
          courseId: data.course_id,
          userId: data.user_id,
          status: data.status,
          createdAt: data.created_at
        }] }));
      },
      updateEnrollment: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase.from('enrollments').update(data).eq('id', id);
        if (!error) set((state) => ({
          enrollments: state.enrollments.map(e => e.id === id ? { ...e, ...data } : e)
        }));
      },
      
        pharmacies: [],
          addPharmacy: async (pharmacy) => {
            const supabase = createClient();
            const { data, error } = await supabase.from('pharmacies').insert({
              name: pharmacy.name,
              name_ar: pharmacy.nameAr,
              owner_id: pharmacy.ownerId,
              wilaya: pharmacy.wilaya,
              city: pharmacy.city,
              address: pharmacy.address,
              phone: pharmacy.phone,
              email: pharmacy.email,
              is_open_24h: false,
              has_delivery: false,
              plan: 'free',
              verified: false
            }).select().single();
            if (!error && data) {
              // Also update the user's pharmacy_id
              await supabase.from('users').update({ pharmacy_id: data.id }).eq('id', pharmacy.ownerId);
              
              set((state) => ({ 
                pharmacies: [...state.pharmacies, {
                  id: data.id,
                  name: data.name,
                  nameAr: data.name_ar,
                  ownerId: data.owner_id,
                  wilaya: data.wilaya,
                  city: data.city,
                  address: data.address,
                  phone: data.phone,
                  email: data.email,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  openingHours: [],
                  isOpen24h: data.is_open_24h,
                  has_delivery: data.has_delivery,
                  plan: data.plan,
                  verified: data.verified,
                  branches: []
                }],
                user: state.user?.id === pharmacy.ownerId ? { ...state.user, pharmacyId: data.id } : state.user
              }));
            }
          },
          updatePharmacy: (id, data) => set((state) => ({
            pharmacies: state.pharmacies.map((p) => (p.id === id ? { ...p, ...data } : p)),
          })),
          deletePharmacy: async (id) => {
            const supabase = createClient();
            const { error } = await supabase.from('pharmacies').delete().eq('id', id);
            if (!error) {
              // Also clear the user's pharmacy_id
              await supabase.from('users').update({ pharmacy_id: null }).eq('pharmacy_id', id);
              
              set((state) => ({
                pharmacies: state.pharmacies.filter((p) => p.id !== id),
                user: state.user?.pharmacyId === id ? { ...state.user, pharmacyId: undefined } : state.user
              }));
            }
          },
  
          factories: [],
            addFactory: async (factory) => {
              const supabase = createClient();
              const { data, error } = await supabase.from('factories').insert({
                name: factory.name,
                name_ar: factory.nameAr,
                owner_id: factory.ownerId,
                wilaya: factory.wilaya,
                city: factory.city,
                address: factory.address,
                phone: factory.phone,
                email: factory.email
              }).select().single();
              if (!error && data) {
                // Also update the user's factory_id
                await supabase.from('users').update({ factory_id: data.id }).eq('id', factory.ownerId);
                
                set((state) => ({ 
                  factories: [...state.factories, {
                    id: data.id,
                    name: data.name,
                    nameAr: data.name_ar,
                    ownerId: data.owner_id,
                    wilaya: data.wilaya,
                    city: data.city,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    createdAt: data.created_at
                  }],
                  user: state.user?.id === factory.ownerId ? { ...state.user, factoryId: data.id } : state.user
                }));
              }
            },
          updateFactory: async (id, data) => {
            const supabase = createClient();
            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.nameAr) updateData.name_ar = data.nameAr;
            if (data.wilaya) updateData.wilaya = data.wilaya;
            if (data.city) updateData.city = data.city;
            if (data.address) updateData.address = data.address;
            if (data.phone) updateData.phone = data.phone;
            if (data.email) updateData.email = data.email;
            const { error } = await supabase.from('factories').update(updateData).eq('id', id);
            if (!error) set((state) => ({
              factories: state.factories.map(f => f.id === id ? { ...f, ...data } : f)
            }));
          },
          deleteFactory: async (id) => {
            const supabase = createClient();
            const { error } = await supabase.from('factories').delete().eq('id', id);
            if (!error) {
              // Also clear the user's factory_id
              await supabase.from('users').update({ factory_id: null }).eq('factory_id', id);
              
              set((state) => ({
                factories: state.factories.filter((f) => f.id !== id),
                user: state.user?.factoryId === id ? { ...state.user, factoryId: undefined } : state.user
              }));
            }
          },
  
          schools: [],
            addSchool: async (school) => {
              const supabase = createClient();
              const { data, error } = await supabase.from('schools').insert({
                name: school.name,
                name_ar: school.nameAr,
                owner_id: school.ownerId,
                wilaya: school.wilaya,
                city: school.city,
                address: school.address,
                phone: school.phone,
                email: school.email
              }).select().single();
              if (!error && data) {
                // Also update the user's school_id
                await supabase.from('users').update({ school_id: data.id }).eq('id', school.ownerId);
                
                set((state) => ({ 
                  schools: [...state.schools, {
                    id: data.id,
                    name: data.name,
                    nameAr: data.name_ar,
                    ownerId: data.owner_id,
                    wilaya: data.wilaya,
                    city: data.city,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    createdAt: data.created_at
                  }],
                  user: state.user?.id === school.ownerId ? { ...state.user, schoolId: data.id } : state.user
                }));
              }
            },
          updateSchool: async (id, data) => {
            const supabase = createClient();
            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.nameAr) updateData.name_ar = data.nameAr;
            if (data.wilaya) updateData.wilaya = data.wilaya;
            if (data.city) updateData.city = data.city;
            if (data.address) updateData.address = data.address;
            if (data.phone) updateData.phone = data.phone;
            if (data.email) updateData.email = data.email;
            const { error } = await supabase.from('schools').update(updateData).eq('id', id);
            if (!error) set((state) => ({
              schools: state.schools.map(s => s.id === id ? { ...s, ...data } : s)
            }));
          },
          deleteSchool: async (id) => {
            const supabase = createClient();
            const { error } = await supabase.from('schools').delete().eq('id', id);
            if (!error) {
              // Also clear the user's school_id
              await supabase.from('users').update({ school_id: null }).eq('school_id', id);
              
              set((state) => ({
                schools: state.schools.filter((s) => s.id !== id),
                user: state.user?.schoolId === id ? { ...state.user, schoolId: undefined } : state.user
              }));
            }
          },

      
      medicines: [],
      addMedicine: async (medicine) => {
        const supabase = createClient();
        const { error } = await supabase.from('medicines').insert({
          id: medicine.id,
          name: medicine.name,
          name_ar: medicine.nameAr,
          generic_name: medicine.genericName,
          category: medicine.category,
          manufacturer: medicine.manufacturer,
          price: medicine.price,
          quantity: medicine.quantity,
          unit: medicine.unit,
          expiry_date: medicine.expiryDate,
          batch_number: medicine.batchNumber,
          barcode: medicine.barcode,
          description: medicine.description,
          requires_prescription: medicine.requiresPrescription,
          pharmacy_id: medicine.pharmacyId,
          is_donation: medicine.isDonation,
        });
        if (!error) set((state) => ({ medicines: [...state.medicines, medicine] }));
      },
      updateMedicine: async (id, data) => {
        const supabase = createClient();
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.nameAr) updateData.name_ar = data.nameAr;
        if (data.genericName) updateData.generic_name = data.genericName;
        if (data.category) updateData.category = data.category;
        if (data.manufacturer) updateData.manufacturer = data.manufacturer;
        if (data.price) updateData.price = data.price;
        if (data.quantity) updateData.quantity = data.quantity;
        if (data.unit) updateData.unit = data.unit;
        if (data.expiryDate) updateData.expiry_date = data.expiryDate;
        if (data.batchNumber) updateData.batch_number = data.batchNumber;
        if (data.barcode) updateData.barcode = data.barcode;
        if (data.description) updateData.description = data.description;
        if (data.requiresPrescription !== undefined) updateData.requires_prescription = data.requiresPrescription;
        if (data.isDonation !== undefined) updateData.is_donation = data.isDonation;

        const { error } = await supabase.from('medicines').update(updateData).eq('id', id);
        if (!error) set((state) => ({
          medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...data } : m)),
        }));
      },
      deleteMedicine: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('medicines').delete().eq('id', id);
        if (!error) set((state) => ({
          medicines: state.medicines.filter((m) => m.id !== id),
        }));
      },
      importMedicines: (medicines) => set((state) => ({
        medicines: [...state.medicines, ...medicines],
      })),
      
      orders: [],
      addOrder: async (order) => {
        const supabase = createClient();
        const { error } = await supabase.from('orders').insert({
          id: order.id,
          user_id: order.userId,
          pharmacy_id: order.pharmacyId,
          items: order.items,
          status: order.status,
          total_amount: order.totalAmount,
          delivery_fee: order.deliveryFee,
          delivery_address: order.deliveryAddress,
          payment_method: order.paymentMethod,
        });
        if (!error) set((state) => ({ orders: [...state.orders, order] }));
      },
      updateOrder: async (id, data) => {
        const supabase = createClient();
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        const { error } = await supabase.from('orders').update(updateData).eq('id', id);
        if (!error) set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
        }));
      },
      
      courses: [],
      userProgress: {},
      updateProgress: (courseId, moduleIndex, score) => set((state) => {
        const current = state.userProgress[courseId] || { completed: [], score: 0 };
        const completed = current.completed.includes(moduleIndex)
          ? current.completed
          : [...current.completed, moduleIndex];
        return {
          userProgress: {
            ...state.userProgress,
            [courseId]: {
              completed,
              score: score !== undefined ? Math.max(current.score, score) : current.score,
            },
          },
        };
      }),
          addCourse: async (course) => {
            const supabase = createClient();
            const { error } = await supabase.from('courses').insert({
              id: course.id,
              trainer_id: course.trainerId,
              title: course.title,
              description: course.description,
              price: course.price,
                duration: course.duration,
                modules: course.modules,
                materials_urls: course.materialsUrls,
                zoom_url: course.zoomUrl
              });
              if (!error) set((state) => ({ courses: [...state.courses, course] }));
            },
            updateCourse: async (id, data) => {
              const supabase = createClient();
              const updateData: any = { ...data };
              if (data.trainerId) { updateData.trainer_id = data.trainerId; delete updateData.trainerId; }
              if (data.materialsUrls) { updateData.materials_urls = data.materialsUrls; delete updateData.materialsUrls; }
              if (data.zoomUrl) { updateData.zoom_url = data.zoomUrl; delete updateData.zoomUrl; }
              const { error } = await supabase.from('courses').update(updateData).eq('id', id);
            if (!error) set((state) => ({
              courses: state.courses.map(c => c.id === id ? { ...c, ...data } : c)
            }));
          },
        deleteCourse: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('courses').delete().eq('id', id);
          if (!error) set((state) => ({
            courses: state.courses.filter(c => c.id !== id)
          }));
        },

        jobOffers: [],
        addJobOffer: async (offer) => {
          const supabase = createClient();
          const { data, error } = await supabase.from('job_offers').insert({
            title: offer.title,
            description: offer.description,
            role: offer.role,
            role_type: offer.roleType,
            location: offer.location,
            salary: offer.salary,
            publisher_id: offer.publisherId
          }).select().single();
          if (!error && data) set((state) => ({ jobOffers: [
            {
              id: data.id,
              title: data.title,
              description: data.description,
              role: data.role,
              roleType: data.role_type,
              location: data.location,
              salary: data.salary,
              publisherId: data.publisher_id,
              createdAt: data.created_at
            }, 
            ...state.jobOffers] }));
        },
        updateJobOffer: async (id, data) => {
          const supabase = createClient();
          const { error } = await supabase.from('job_offers').update(data).eq('id', id);
          if (!error) set((state) => ({
            jobOffers: state.jobOffers.map(j => j.id === id ? { ...j, ...data } : j)
          }));
        },
        deleteJobOffer: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('job_offers').delete().eq('id', id);
          if (!error) set((state) => ({
            jobOffers: state.jobOffers.filter(j => j.id !== id)
          }));
        },
        
          prescriptions: [],
          medicalDossiers: [],
          addPrescription: async (prescription) => {
            const supabase = createClient();
            const { data, error } = await supabase.from('prescriptions').insert({
              doctor_id: prescription.doctorId,
              patient_id: prescription.patientId,
              patient_cnas_number: prescription.patientCNAS,
              diagnosis: prescription.diagnosis,
              medications: prescription.medications,
              cnas_eligible: prescription.cnasEligible,
              stamped: prescription.stamped,
              notes: prescription.notes
            }).select().single();
            if (!error && data) set((state) => ({ prescriptions: [
              {
                id: data.id,
                doctorId: data.doctor_id,
                patientId: data.patient_id,
                patientCNAS: data.patient_cnas_number,
                diagnosis: data.diagnosis,
                medications: data.medications,
                cnasEligible: data.cnas_eligible,
                stamped: data.stamped,
                notes: data.notes,
                createdAt: data.created_at
              },
              ...state.prescriptions] }));
          },
          updateMedicalDossier: async (dossier) => {
            const supabase = createClient();
            const { error } = await supabase.from('medical_dossiers').upsert({
              patient_id: dossier.patientId,
              blood_type: dossier.bloodType,
              allergies: dossier.allergies,
              chronic_diseases: dossier.chronicDiseases,
              last_checkup: dossier.lastCheckup,
              history: dossier.history,
              notes: dossier.notes
            });
            if (!error) set((state) => ({
              medicalDossiers: state.medicalDossiers.map(d => d.patientId === dossier.patientId ? dossier : d).concat(state.medicalDossiers.some(d => d.patientId === dossier.patientId) ? [] : [dossier])
            }));
          },
          addMedicalDossier: async (dossier) => {
            const supabase = createClient();
            const { data, error } = await supabase.from('medical_dossiers').insert({
              patient_id: dossier.patientId,
              blood_type: dossier.bloodType,
              allergies: dossier.allergies,
              chronic_diseases: dossier.chronicDiseases,
              last_checkup: dossier.lastCheckup,
              history: dossier.history,
              notes: dossier.notes
            }).select().single();
            if (!error && data) set((state) => ({
              medicalDossiers: [...state.medicalDossiers, { ...data, patientId: data.patient_id, bloodType: data.blood_type, chronicDiseases: data.chronic_diseases, lastCheckup: data.last_checkup }]
            }));
          },
        
        productionLines: [],
        addProductionLine: async (line) => {
          const supabase = createClient();
          const { data, error } = await supabase.from('production_lines').insert({
            factory_id: line.factoryId,
            name: line.name,
            medicine_name: line.medicineName,
            status: line.status,
            progress: line.progress,
            daily_output: line.dailyOutput
          }).select().single();
          if (!error && data) set((state) => ({ productionLines: [...state.productionLines, data] }));
        },
        updateProductionLine: async (id, data) => {
          const supabase = createClient();
          const { error } = await supabase.from('production_lines').update(data).eq('id', id);
          if (!error) set((state) => ({
            productionLines: state.productionLines.map(l => l.id === id ? { ...l, ...data } : l)
          }));
        },
        deleteProductionLine: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('production_lines').delete().eq('id', id);
          if (!error) set((state) => ({
            productionLines: state.productionLines.filter(l => l.id !== id)
          }));
        },

      
      factoryInventory: [],
      addFactoryInventory: async (item) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('factory_inventory').insert({
          factory_id: item.factoryId,
          medicine_name: item.medicineName,
          quantity: item.quantity,
          price: item.price,
          batch_number: item.batchNumber,
          expiry_date: item.expiryDate
        }).select().single();
        if (!error && data) set((state) => ({ factoryInventory: [...state.factoryInventory, {
          id: data.id,
          factoryId: data.factory_id,
          medicineName: data.medicine_name,
          quantity: data.quantity,
          price: data.price,
          batchNumber: data.batch_number,
          expiryDate: data.expiry_date,
          createdAt: data.created_at
        }] }));
      },

      factoryOrders: [],
      addFactoryOrder: async (order) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('factory_orders').insert({
          pharmacy_id: order.pharmacyId,
          factory_id: order.factoryId,
          items: order.items,
          status: order.status,
          total_amount: order.totalAmount
        }).select().single();
        if (!error && data) set((state) => ({ factoryOrders: [
          {
            id: data.id,
            pharmacyId: data.pharmacy_id,
            factoryId: data.factory_id,
            items: data.items,
            status: data.status,
            totalAmount: data.total_amount,
            createdAt: data.created_at
          },
          ...state.factoryOrders] }));
      },
      updateFactoryOrder: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase.from('factory_orders').update(data).eq('id', id);
        if (!error) set((state) => ({
          factoryOrders: state.factoryOrders.map(o => o.id === id ? { ...o, ...data } : o)
        }));
      },

      cnasStatuses: {},
      updateCNASStatus: async (status) => {
        const supabase = createClient();
        const { error } = await supabase.from('cnas_status').upsert({
          user_id: status.userId,
          cnas_number: status.cnasNumber,
          is_insured: status.isInsured
        });
        if (!error) set((state) => ({
          cnasStatuses: { ...state.cnasStatuses, [status.userId]: status }
        }));
      },
      
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),
      clearChat: () => set({ chatMessages: [] }),
      
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [{ id: `notif-${Date.now()}`, ...notification, read: false, createdAt: new Date().toISOString() }, ...state.notifications],
      })),
        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        })),

        deleteUser: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('users').delete().eq('id', id);
          if (!error) set((state) => ({
            users: state.users.filter(u => u.id !== id)
          }));
        },
        deleteEnrollment: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('enrollments').delete().eq('id', id);
          if (!error) set((state) => ({
            enrollments: state.enrollments.filter(e => e.id !== id)
          }));
        },
        deleteAppointment: async (id) => {
          const supabase = createClient();
          const { error } = await supabase.from('appointments').delete().eq('id', id);
          if (!error) set((state) => ({
            appointments: state.appointments.filter(a => a.id !== id)
          }));
        },

        fetchInitialData: async () => {

        const supabase = createClient();
            const [
              { data: pharmacies },
              { data: factories },
              { data: schools },
              { data: medicines },
              { data: orders },
              { data: courses },
              { data: jobs },
              { data: prescriptions },
              { data: production },
              { data: factoryInv },
              { data: factoryOrd },
              { data: cnas },
                { data: users },
                { data: appts },
                { data: enrls },
                { data: dossiers }
              ] = await Promise.all([
                supabase.from('pharmacies').select('*'),
                supabase.from('factories').select('*'),
                supabase.from('schools').select('*'),
                supabase.from('medicines').select('*'),
                supabase.from('orders').select('*'),
                supabase.from('courses').select('*'),
                supabase.from('job_offers').select('*').order('created_at', { ascending: false }),
                supabase.from('prescriptions').select('*').order('created_at', { ascending: false }),
                supabase.from('production_lines').select('*'),
                supabase.from('factory_inventory').select('*'),
                supabase.from('factory_orders').select('*'),
                supabase.from('cnas_status').select('*'),
                supabase.from('users').select('*'),
                supabase.from('appointments').select('*'),
                supabase.from('enrollments').select('*'),
                supabase.from('medical_dossiers').select('*')
              ]);
      
                if (users) set({ users: users.map((u: any) => ({ 
                  ...u, 
                  fullName: u.full_name, 
                  role: u.role as UserRole, 
                  plan: u.plan as SubscriptionPlan, 
                  isApproved: u.is_approved, 
                  createdAt: u.created_at,
                  pharmacyId: u.pharmacy_id,
                  factoryId: u.factory_id,
                  schoolId: u.school_id
                })) });
              if (pharmacies) set({ pharmacies: pharmacies.map((p: any) => ({ ...p, nameAr: p.name_ar, ownerId: p.owner_id, isOpen24h: p.is_open_24h, hasDelivery: p.has_delivery, openingHours: [] })) });
              if (factories) set({ factories: factories.map((f: any) => ({ ...f, nameAr: f.name_ar, ownerId: f.owner_id, createdAt: f.created_at })) });
              if (schools) set({ schools: schools.map((s: any) => ({ ...s, nameAr: s.name_ar, ownerId: s.owner_id, createdAt: s.created_at })) });
            if (medicines) set({ medicines: medicines.map((m: any) => ({ ...m, nameAr: m.name_ar, genericName: m.generic_name, expiryDate: m.expiry_date, batchNumber: m.batch_number, requiresPrescription: m.requires_prescription, pharmacyId: m.pharmacy_id, isDonation: m.is_donation })) });
            if (orders) set({ orders: orders.map((o: any) => ({ ...o, userId: o.user_id, pharmacyId: o.pharmacy_id, totalAmount: o.total_amount, deliveryFee: o.delivery_fee, deliveryAddress: o.delivery_address, paymentMethod: o.payment_method, createdAt: o.created_at, updatedAt: o.updated_at })) });
              if (courses) set({ courses: courses.map((c: any) => ({ ...c, trainerId: c.trainer_id, titleAr: c.title_ar || c.title, descriptionAr: c.description_ar || c.description, modules: c.modules || [], materialsUrls: c.materials_urls || [], zoomUrl: c.zoom_url })) });
            if (jobs) set({ jobOffers: jobs.map((j: any) => ({ ...j, id: j.id.toString(), roleType: j.role_type, publisherId: j.publisher_id, createdAt: j.created_at })) });
            if (prescriptions) set({ prescriptions: prescriptions.map((p: any) => ({ ...p, doctorId: p.doctor_id, patientId: p.patient_id, patientCNAS: p.patient_cnas_number, cnasEligible: p.cnas_eligible, createdAt: p.created_at })) });
            if (production) set({ productionLines: production });
            if (factoryInv) set({ factoryInventory: factoryInv.map((i: any) => ({ ...i, factoryId: i.factory_id, medicineName: i.medicine_name, batchNumber: i.batch_number, expiryDate: i.expiry_date, createdAt: i.created_at })) });
            if (factoryOrd) set({ factoryOrders: factoryOrd.map((o: any) => ({ ...o, pharmacyId: o.pharmacy_id, factoryId: o.factory_id, totalAmount: o.total_amount, createdAt: o.created_at })) });
            if (appts) set({ appointments: appts.map((a: any) => ({ ...a, doctorId: a.doctor_id, patientId: a.patient_id, createdAt: a.created_at })) });
            if (enrls) set({ enrollments: enrls.map((e: any) => ({ ...e, courseId: e.course_id, userId: e.user_id, createdAt: e.created_at })) });
            if (dossiers) set({ medicalDossiers: dossiers.map((d: any) => ({ ...d, patientId: d.patient_id, bloodType: d.blood_type, chronicDiseases: d.chronic_diseases, lastCheckup: d.last_checkup })) });
          if (cnas) {

          const cnasMap: { [userId: string]: CNASStatus } = {};
          cnas.forEach((c: any) => {
            cnasMap[c.user_id] = { userId: c.user_id, cnasNumber: c.cnas_number, isInsured: c.is_insured, updatedAt: c.updated_at };
          });
          set({ cnasStatuses: cnasMap });
        }
      },
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'dar-al-shifaa-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
