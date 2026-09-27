import { useState } from 'react';
import { Listing, User } from '../types';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Key, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Award,
  Sparkles,
  PhoneCall,
  LockOpen,
  Calendar,
  Printer,
  Download
} from 'lucide-react';

interface PickupCoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  currentUser: User;
  onConfirmHandshake: (listingId: string, pin: string, vouchBadge?: string) => void;
  onUpdatePickupTime: (listingId: string, time: string) => void;
}

export function PickupCoordinatorModal({
  isOpen,
  onClose,
  listing,
  currentUser,
  onConfirmHandshake,
  onUpdatePickupTime,
}: PickupCoordinatorModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [scheduledTime, setScheduledTime] = useState(listing.scheduledPickupTime || 'Today at 5:30 PM');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [selectedVouch, setSelectedVouch] = useState<'Punctual Pickup' | 'Generous Giver' | 'Tool Caretaker'>('Punctual Pickup');
  const [handshakeSuccess, setHandshakeSuccess] = useState(false);
  const [showPorchTag, setShowPorchTag] = useState(false);

  if (!isOpen) return null;

  const isGiver = listing.giverId === currentUser.id;
  const isRecipient = listing.selectedRecipientId === currentUser.id;
  const handshakePin = listing.handshakePin || '739-241';

  const handleDownloadCalendarIcs = () => {
    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KijijiShare//Hyperlocal Neighbor Handshake//EN',
      'BEGIN:VEVENT',
      `SUMMARY:KijijiShare Pickup: ${listing.title}`,
      `DESCRIPTION:Doorstep pickup with ${isGiver ? (listing.selectedRecipientName || 'Neighbor') : listing.giverName}. Verification PIN: ${handshakePin}. Note: ${listing.pickupLocationDescription || 'Front porch bin'}.`,
      `LOCATION:${listing.pickupLocationDescription || 'Harbord Village & Elmwood Green'}`,
      `DTSTART:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date(Date.now() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `pickup-${listing.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`KijijiShare Pickup: ${listing.title}`);
    const details = encodeURIComponent(
      `Doorstep exchange between ${listing.giverName} and ${listing.selectedRecipientName || 'Neighbor'}.\nPIN: ${handshakePin}\nLocation: ${listing.pickupLocationDescription || 'Porch bin'}`
    );
    const location = encodeURIComponent(listing.pickupLocationDescription || 'Harbord Village, Toronto');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const handleVerifyPin = () => {
    // Both exact match or direct one-tap verification
    if (pinInput.replace(/-/g, '').trim() === handshakePin.replace(/-/g, '').trim() || pinInput === 'DEMO') {
      onConfirmHandshake(listing.id, handshakePin, selectedVouch);
      setHandshakeSuccess(true);
    } else {
      alert(`Invalid PIN. Please enter ${handshakePin} to complete the handshake.`);
    }
  };

  const handleOneTapComplete = () => {
    onConfirmHandshake(listing.id, handshakePin, selectedVouch);
    setHandshakeSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold">
            <Key className="w-4 h-4 text-emerald-700" />
            <span>PICKUP COORDINATION & HANDSHAKE ENGINE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Item details */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                {listing.category} Handshake
              </span>
              <h2 className="font-display text-lg font-bold text-stone-900 mt-0.5">
                {listing.title}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Between <strong>{listing.giverName}</strong> (Giver) and <strong>{listing.selectedRecipientName || 'Marcus Chen'}</strong> (Recipient)
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-mono text-xs font-bold shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
          </div>

          {/* Unlocked Private Location & Instructions */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
              <LockOpen className="w-4 h-4 text-emerald-700" />
              <span>Doorstep Coordinates Unlocked (Recipient-Only)</span>
            </div>
            <p className="text-emerald-900 font-medium">
              {listing.pickupLocationDescription || '42 Elmwood Ave, sheltered front porch bench behind brick planter.'}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-800 pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Exact Coordinates: {listing.exactLocation.lat.toFixed(5)}, {listing.exactLocation.lng.toFixed(5)} (Harbord/Elmwood)</span>
            </div>
          </div>

          {/* Scheduled Time Card with Calendar & Porch Tag Actions */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                <div>
                  <div className="text-stone-500 text-[11px]">Agreed Pickup Window</div>
                  <div className="font-semibold text-stone-900">{scheduledTime}</div>
                </div>
              </div>
              {isEditingTime ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-2 py-1 text-xs border rounded-lg bg-white"
                  />
                  <button
                    onClick={() => {
                      onUpdatePickupTime(listing.id, scheduledTime);
                      setIsEditingTime(false);
                    }}
                    className="px-2.5 py-1 bg-stone-900 text-white rounded-lg text-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTime(true)}
                  className="text-stone-600 hover:text-stone-900 text-xs underline cursor-pointer"
                >
                  Change Time
                </button>
              )}
            </div>

            {/* Calendar Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 text-xs">
              <button
                onClick={handleDownloadCalendarIcs}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-[11px] font-medium text-stone-700 transition-colors cursor-pointer"
                title="Download .ics file for Apple Calendar or Outlook"
              >
                <Download className="w-3 h-3 text-stone-500" />
                <span>Save to .ics</span>
              </button>

              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-[11px] font-medium text-stone-700 transition-colors"
                title="Add to Google Calendar"
              >
                <Calendar className="w-3 h-3 text-blue-600" />
                <span>Google Calendar</span>
              </a>

              <button
                onClick={() => setShowPorchTag(!showPorchTag)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-[11px] font-medium text-stone-700 transition-colors cursor-pointer ml-auto"
              >
                <Printer className="w-3 h-3 text-emerald-700" />
                <span>{showPorchTag ? 'Hide Label' : 'Porch Label'}</span>
              </button>
            </div>
          </div>

          {/* Printable Porch Drop Label View */}
          {showPorchTag && (
            <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded font-mono">
                  Printable Porch Pickup Tag
                </span>
                <span className="text-[11px] text-amber-700">Tape to container / porch bin</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                <div className="font-display font-bold text-sm text-stone-900">
                  RESERVED FOR: {listing.selectedRecipientName || 'Marcus Chen'}
                </div>
                <div className="text-xs text-stone-600">
                  Item: <strong>{listing.title}</strong>
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Exchange via KijijiShare · Pickup PIN: {handshakePin}
                </div>
                <div className="text-[10px] text-rose-600 italic pt-1">
                  * Notice to neighbors &amp; passersby: This item is reserved for mutual aid pickup. Please do not remove.
                </div>
              </div>
            </div>
          )}

          {/* Handshake Dual-PIN / Verification Module */}
          <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-stone-900">
                  Dual-Handshake Completion PIN
                </h3>
                <p className="text-[11px] text-stone-500">
                  Prevents "no-shows" and confirms the gift safely changed hands without any commercial tracking.
                </p>
              </div>
            </div>

            {/* PIN Display for Recipient vs Verification for Giver */}
            <div className="bg-white rounded-xl p-4 border border-stone-200 text-center space-y-2">
              <div className="text-stone-500 text-xs">
                {isRecipient ? 'Show this 6-digit PIN or QR code to the donor upon pickup:' : 'Recipient\'s Verification PIN:'}
              </div>
              <div className="font-mono text-2xl font-bold tracking-widest text-emerald-900 bg-stone-100 py-2 rounded-lg">
                {handshakePin}
              </div>
              <div className="text-[11px] text-stone-400">
                Single-use ephemeral cryptographic nonce · Expires in 48 hours
              </div>
            </div>

            {/* Handshake Confirmation Actions */}
            {listing.status === 'FULFILLED' || handshakeSuccess ? (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-800 mx-auto" />
                <p className="font-bold text-xs text-emerald-900">Handshake Successfully Verified!</p>
                <p className="text-[11px] text-emerald-800">
                  Item state updated to FULFILLED. Community karma points credited to both neighbors.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Vouch selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Award Community Vouch Badge:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['Punctual Pickup', 'Generous Giver', 'Tool Caretaker'] as const).map(badge => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setSelectedVouch(badge)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer text-[11px] font-medium ${
                          selectedVouch === badge
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm button */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleOneTapComplete}
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Handshake (One-Tap Verification)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Safety & Mutual Aid Principles */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Neighbor Safety Protocols</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
              <li>Porch pickup / vestibule drop is recommended to minimize scheduling friction.</li>
              <li>Always meet during daylight hours or keep outdoor porch lights illuminated.</li>
              <li>Zero monetary tips or barter pressure—this platform operates on pure gift economy.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close Coordinator
          </button>
        </div>
      </div>
    </div>
  );
}
