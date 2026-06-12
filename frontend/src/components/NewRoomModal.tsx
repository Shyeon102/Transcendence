import { useState } from "react";
import { useCreateChatRoomMutation } from "../store/api/chatApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const NewRoomModal = ({ isOpen, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);
  const [createChatRoom, { isLoading }] = useCreateChatRoomMutation(); // createChatRoom: trigger:호출하면 백엔드에 POST 요청, isLoading: 결과상태(로딩, 에러 등): 요청 중인지

  if (!isOpen) return null; // 모달 닫힌 상태면 아무것도 안 그림

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await createChatRoom({
        title,
        description,
        max_members: maxMembers,
      }).unwrap();
      setTitle("");
      setDescription("");
      setMaxMembers(10);
      onClose();
    } catch (err) {
      console.error("방 생성 실패:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded text-white w-96">
        <h2 className="text-xl font-bold mb-4">New Room</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-[#0c0c0b] px-3 py-2 rounded mb-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full bg-[#0c0c0b] px-3 py-2 rounded mb-2"
        />
        <input
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(Number(e.target.value))}
          placeholder="Max members"
          className="w-full bg-[#0c0c0b] px-3 py-2 rounded mb-2"
          min={1}
          max={50}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-[#e8d5b7] text-black py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a3a3a] py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRoomModal;
