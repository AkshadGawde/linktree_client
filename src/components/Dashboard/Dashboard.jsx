import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContexts";
import {
  getDashboard,
  getReferrals,
  getReferralStats,
  logoutUser,
} from "../../services/api";
import { toast } from "react-toastify";
import ReferralStats from "./ReferralStats";

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await getDashboard();
        console.log("Dashboard API Response:", dashboardRes.data);
        setUser(dashboardRes.data.user);

        const [referralsRes, statsRes] = await Promise.all([
          getReferrals(),
          getReferralStats(),
        ]);

        setReferrals(referralsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error.response?.data || error);
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setUser, navigate]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const copyReferralLink = () => {
    const referralLink = `http://localhost:3000/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode);
    toast.success("Referral code copied!");
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-md p-6">
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {user?.username} 🎉
        </h2>
        <p className="text-gray-600 mb-2">Email: {user?.email}</p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={user?.referralCode}
            readOnly
            className="border p-2 w-full rounded-md text-gray-600"
          />
          <button
            onClick={copyReferralCode}
            className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600"
          >
            Copy Code
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={`http://localhost:3000/register?ref=${user?.referralCode}`}
            readOnly
            className="border p-2 w-full rounded-md text-gray-600"
          />
          <button
            onClick={copyReferralLink}
            className="bg-green-500 text-white px-2 py-2 rounded-md hover:bg-green-600"
          >
            Copy Link
          </button>
        </div>

        <ReferralStats stats={stats} />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Referrals</h3>
          <ul className="border rounded-md p-4 bg-white">
            {referrals.length > 0 ? (
              referrals.map((ref, index) => (
                <li key={index} className="border-b py-2">
                  {ref.referredUserId.username} - {ref.status}
                </li>
              ))
            ) : (
              <p>No referrals yet</p>
            )}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
