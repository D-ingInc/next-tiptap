import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { getPost, savePost } from "@/services/post";

interface PostForm {
  title: string;
  content: string;
}

export default function EditForm() {
  const { register, handleSubmit, control, reset } = useForm<PostForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const editorRef = useRef<TiptapEditorRef>(null);

  useEffect(() => {
    getPost().then((data) => {
      reset({
        title: data.title,
        content: data.content,
      });
    });
  }, [reset]);

  const onSubmit = async (data: PostForm) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await savePost(data);
      if (response.success) {
        setMessage("保存に成功しました！");
      } else {
        setMessage("保存に失敗しました。");
      }
    } catch (error: any) {
      console.error("記事保存エラー:", error);
      setMessage("保存中にエラーが発生しました。");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="inline-block font-medium dark:text-white mb-2">Title</label>
        <input
          type="text"
          {...register("title", { required: true })}
          className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
          placeholder="Enter post title..."
        />
      </div>
      <div>
        <label>内容</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              initialContent={field.value}
              onContentChange={field.onChange}
              ref={editorRef}
            />
          )}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
      >
        {loading ? "保存中..." : "保存"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
