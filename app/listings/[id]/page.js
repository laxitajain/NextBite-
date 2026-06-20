import { connectMongoDB } from "@/lib/mongodb";
import FoodListing from "@/models/foodListing";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, Clock, Users, Phone, Mail, ChevronLeft, Calendar, Info 
} from "lucide-react";
import ProfileMap from "@/app/_components/ProfileMap";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/user";
import PickupRequest from "@/models/pickupRequest";
import ListingActionButtons from "@/app/_components/ListingActionButtons";

const STATUS_STYLE = {
  available: "bg-accent-mango text-primary border-secondary",
  reserved: "bg-secondary/30 text-primary border-secondary",
  picked_up: "bg-accent-rust text-primary/70 border-accent-rust",
  expired: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default async function ListingDetailPage({ params }) {
  const { id } = params;
  
  await connectMongoDB();
  
  const listing = await FoodListing.findById(id)
    .populate("donorId", "name phone email address image role")
    .lean();

  if (!listing) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let currentUser = null;
  let hasRequested = false;
  let isSaved = false;

  if (session?.user?.email) {
    const rawUser = await User.findOne({ email: session.user.email }).lean();
    if (rawUser) {
      currentUser = JSON.parse(JSON.stringify(rawUser));
      
      // Check if user has saved this listing
      if (rawUser.savedListings?.some(savedId => savedId.toString() === id)) {
        isSaved = true;
      }

      // Check if user has already requested this listing
      const existingReq = await PickupRequest.findOne({
        listingId: id,
        recipientId: rawUser._id,
        status: { $in: ["pending", "accepted"] }
      }).lean();

      if (existingReq) {
        hasRequested = true;
      }
    }
  }

  // Next.js client component serialization fix for Mongoose lean docs
  const safeListing = JSON.parse(JSON.stringify(listing));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const statusClass = STATUS_STYLE[listing.status] || "bg-accent-rust text-primary/70";

  return (
    <div className="w-full max-w-5xl mx-auto pt-2 md:pt-6 pb-12 px-4 md:px-0">
      <Link href="/recipient" className="inline-flex items-center text-primary/70 hover:text-secondary mb-6 font-semibold transition bg-white/50 px-3 py-1.5 rounded-full border border-accent-rust/40 backdrop-blur-sm shadow-sm">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white/90 backdrop-blur-sm border border-accent-rust/60 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Top Header Section */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 border-b border-accent-rust/30 relative">
          <div className="absolute top-6 right-6 z-10">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 shadow-sm ${statusClass}`}>
              {listing.status.replace("_", " ")}
            </span>
          </div>

          <div className="w-full md:w-1/3 aspect-square max-h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-accent-mango via-secondary to-accent-pink flex items-center justify-center shrink-0 shadow-sm border border-accent-rust/30 relative">
            {listing.images && listing.images.length > 0 ? (
              <Image 
                src={listing.images[0]} 
                alt={listing.title} 
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-white text-7xl drop-shadow-md">🍽️</span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <div className="flex flex-wrap gap-2 mb-4 pr-32">
                {listing.pricingType === "discounted" ? (
                  <span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center">
                    ₹{listing.discountedPrice}
                    {listing.estimatedValue && <span className="ml-2 text-[10px] line-through opacity-70">₹{listing.estimatedValue}</span>}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center">
                    FREE
                    {listing.estimatedValue && <span className="ml-2 text-[10px] opacity-80 font-normal normal-case">Value: ₹{listing.estimatedValue}</span>}
                  </span>
                )}
                {listing.foodTypes?.map((type, index) => (
                  <span key={index} className="px-3 py-1 bg-accent-mango text-primary text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                    {type}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-anton text-primary mb-4 leading-tight">
                {listing.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {listing.isVegetarian && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full border border-green-200 shadow-sm">
                    🥬 Vegetarian
                  </span>
                )}
                {listing.isVegan && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full border border-green-200 shadow-sm">
                    🌱 Vegan
                  </span>
                )}
                <span className="flex items-center text-primary/70 font-semibold text-sm bg-accent-light px-3 py-1 rounded-full border border-accent-rust/40">
                  <Users className="w-4 h-4 mr-1.5 text-secondary" />
                  {listing.servings} Servings
                </span>
                <span className="flex items-center text-primary/70 font-semibold text-sm bg-accent-light px-3 py-1 rounded-full border border-accent-rust/40">
                  <Clock className="w-4 h-4 mr-1.5 text-secondary" />
                  Expires: {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <ListingActionButtons 
              listing={safeListing} 
              user={currentUser} 
              initialHasRequested={hasRequested}
              initialIsSaved={isSaved}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-accent-light/20">
          
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-anton text-primary mb-4">Description</h2>
              <p className="text-lg text-primary/80 leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-2xl border border-accent-rust/40 shadow-sm">
                {listing.description}
              </p>
            </section>

            {listing.allergens && listing.allergens.length > 0 && (
              <section className="p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                <h3 className="font-anton text-xl text-red-800 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Allergen Warning
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.allergens.map((allergen, index) => (
                    <span key={index} className="px-3 py-1.5 bg-white text-red-800 text-sm font-bold rounded-full border border-red-200 shadow-sm">
                      {allergen}
                    </span>
                  ))}
                </div>
              </section>
            )}
            
            {listing.pickupNotes && (
              <section className="p-6 bg-accent-mango/20 border border-secondary/30 rounded-2xl shadow-sm">
                <h3 className="font-anton text-xl text-primary mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-secondary" /> Pickup Instructions
                </h3>
                <p className="text-primary/80 font-medium leading-relaxed">{listing.pickupNotes}</p>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Donor Card */}
            <section className="bg-white p-6 rounded-2xl border border-accent-rust/60 shadow-sm">
              <h3 className="font-anton text-xl text-primary mb-5 border-b border-accent-rust/40 pb-3">About the Donor</h3>
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-accent-mango border-4 border-accent-light shadow-md mb-3">
                  {listing.donorId?.image ? (
                    <Image src={listing.donorId.image} alt={listing.donorId.name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-3xl">🏢</span>
                  )}
                </div>
                <h4 className="font-bold text-primary text-xl leading-tight">{listing.donorId?.name}</h4>
                <span className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">{listing.donorId?.role}</span>
              </div>
              
              <div className="space-y-3 text-sm">
                {listing.donorId?.phone && (
                  <div className="flex items-center justify-center gap-2 text-primary/80 bg-accent-light p-3 rounded-xl border border-accent-rust/40">
                    <Phone className="w-4 h-4 text-secondary" />
                    <span className="font-semibold">{listing.donorId.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-primary/80 bg-accent-light p-3 rounded-xl border border-accent-rust/40">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span className="font-semibold line-clamp-1">{listing.donorId?.email}</span>
                </div>
              </div>
            </section>

            {/* Location Card */}
            <section className="bg-white p-6 rounded-2xl border border-accent-rust/60 shadow-sm">
              <h3 className="font-anton text-xl text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                Location
              </h3>
              <div className="text-primary/80 text-sm mb-4 bg-accent-light p-3 rounded-xl border border-accent-rust/40">
                <p className="font-bold mb-0.5">{listing.location.address}</p>
                <p>{listing.location.city}, {listing.location.pincode}</p>
              </div>
              
              <div className="w-full h-56 rounded-xl overflow-hidden border border-accent-rust/40 relative z-0 shadow-inner">
                 {listing.location.coordinates?.coordinates && (
                   <ProfileMap 
                     coordinates={{
                       longitude: listing.location.coordinates.coordinates[0],
                       latitude: listing.location.coordinates.coordinates[1]
                     }}
                     address={listing.location.address}
                     className="w-full h-full"
                   />
                 )}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
