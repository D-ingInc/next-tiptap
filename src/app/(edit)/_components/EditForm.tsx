import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { getPost, savePost, saveDraft } from "@/services/post";
import Button from "@/components/TiptapEditor/components/ui/Button";

interface PostForm {
  title: string;
  content: string;
}

interface EditFormProps {
  isNew?: boolean;
}

const defaultValues: PostForm = {
  title: "",
  content: "",
};

export default function EditForm({ isNew = false }: EditFormProps) {
  const router = useRouter();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const { control, reset, getValues, watch } = useForm<PostForm>({
    defaultValues: isNew ? defaultValues : undefined,
  });

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [editorRef.current]
  );

  useEffect(() => {
    if (!isNew) {
      getPost().then((post) => {
        reset({ ...post });
        setIsLoading(false);
      });
    }
  }, [isNew]);

  // 内容が変更されたら下書きを保存
  useEffect(() => {
    const subscription = watch((values) => {
      if (values.title || values.content) {
        saveDraft({ 
          ...values, 
          wordCount: getWordCount() 
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = getValues();
      const post = await savePost({ 
        ...values, 
        wordCount: getWordCount() 
      });
      // 保存成功後、記事詳細ページに遷移
      router.push(`/posts/${post.id}`);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {isNew ? "新規記事作成" : "記事編集"}
      </h1>
      
      <div>
        <label className="inline-block font-medium dark:text-white mb-2">Title</label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="記事のタイトルを入力..."
            />
          )}
        />
      </div>

      <div>
        <label className="inline-block font-medium dark:text-white mb-2">Content</label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              ssr={true}
              output="html"
              placeholder={{
                paragraph: "Type your content here...",
                imageCaption: "Type caption for image (optional)",
              }}
              contentMinHeight={256}
              contentMaxHeight={640}
              onContentChange={field.onChange}
              initialContent={field.value}
            />
          )}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2"
        >
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
