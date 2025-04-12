import Link from "next/link";
import { useEffect, useState } from "react";
import useUser from "@/store/useUser";
import axios from "axios";
import { BiChevronDown } from "react-icons/bi";
import { PiUserSwitch } from "react-icons/pi";

export default function Header() {
  const { currentUser, setTeacherAndStudent, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/users");
      const users = data.users;
      setTeacherAndStudent(users[0], users[1]);
      switchUser("teacher");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="flex items-center justify-between bg-black px-4 h-[5rem] border-b border-neutral-800">
      <Link className="text-3xl font-bold text-white" href="/">
        AI Vita
      </Link>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-4 px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
      >
        <p
          className={`text-2xl font-bold w-10 flex justify-center items-center h-10 rounded-lg border-2 text-white ${
            currentUser?.role === "teacher"
              ? "border-orange-400 bg-orange-400/20"
              : "border-blue-400 bg-blue-400/20"
          }`}
        >
          {currentUser?.name.at(0)}
        </p>
        <div className="flex flex-col">
          <p className="text-md font-bold text-white">{currentUser?.name}</p>
          <p className="text-sm text-gray-400 capitalize">
            {currentUser?.role}
          </p>
        </div>
        <BiChevronDown className="text-2xl text-white" />
      </div>
      {isOpen && (
        <div className="absolute top-24 right-10 p-2 bg-black rounded-md shadow-md border-2 border-white/10">
          <div
            onClick={() => {
              switchUser(
                currentUser?.role === "teacher" ? "student" : "teacher"
              );
              setIsOpen(false);
            }}
            className="flex items-center justify-center gap-2 p-2 hover:bg-white/5 cursor-pointer rounded-md"
          >
            <PiUserSwitch className="text-2xl text-white" />
            <p className="text-md font-medium text-white">Switch User</p>
          </div>
        </div>
      )}
    </div>
  );
}
