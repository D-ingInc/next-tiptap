"use client";

import EditForm from "../(edit)/_components/EditForm";

export default function NewPostPage() {
  return (
    <div className="max-w-[56rem] w-full mx-auto py-10 px-6">
      <EditForm isNew />
    </div>
  );
} 