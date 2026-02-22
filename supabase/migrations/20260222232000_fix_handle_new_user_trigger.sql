-- Fix default plan being set to 'pro' for new users 
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, full_name, plan)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'starter' 
  );
  return new;
end;
$function$;
